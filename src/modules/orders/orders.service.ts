import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { createCipheriv, createHash, randomBytes } from 'crypto'
import { Repository } from 'typeorm'
import { EventsService } from '~/modules/events-module/events.service'
import { CheckoutDataDto, CreateOrderDto, OrderResponseDto } from '~/modules/orders/dto/orders.dto'
import { Orders, OrderStatus } from '~/modules/orders/orders.entity'
import { CheckoutResponse, CreateCheckout, Item } from '~/modules/pagbank/interface/pagbank.interface'
import { PagBankService } from '~/modules/pagbank/pagbank.service'
import { TicketTypesService } from '~/modules/ticket-types/ticket-types.service'
import { TicketStatus } from '~/modules/tickets/tickets.entity'
import { TicketsService } from '~/modules/tickets/tickets.service'
import { UsersService } from '~/modules/users/users.service'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders)
    private ordersRepository: Repository<Orders>,
    private configService: ConfigService,
    private ticketTypesService: TicketTypesService,
    private pagbankService: PagBankService,
    private usersService: UsersService,
    private eventsService: EventsService,
    private ticketsService: TicketsService,
  ) {}

  async createOrder(userId: string, eventId: string, body: CreateOrderDto): Promise<OrderResponseDto> {
    const { order, checkoutLinks: checkout } = await this.createBody(userId, eventId, body)
    const data = await this.ordersRepository.save(order)
    const { qrCodes, ticketIds } = await this.createTicket(data.id, userId, eventId, body)
    return { data: { orderId: data.id, checkoutLinks: checkout, qrCodes, ticketIds } }
  }

  private async createBody(
    userId: string,
    eventId: string,
    body: CreateOrderDto,
  ): Promise<{ order: Orders; checkoutLinks: CheckoutDataDto[] }> {
    const status: OrderStatus = OrderStatus.PENDING
    const { checkout, totalAmount } = await this.createCheckout(userId, eventId, body)
    const order = this.ordersRepository.create({
      userId,
      eventId,
      totalAmount,
      status,
      gatewayTransactionId: checkout.id,
    })
    return { order, checkoutLinks: checkout.links }
  }

  private async createCheckout(
    userId: string,
    eventId: string,
    body: CreateOrderDto,
  ): Promise<{ checkout: CheckoutResponse; totalAmount: number }> {
    const { data: user } = await this.usersService.getById(userId)
    const { data: event } = await this.eventsService.getById(eventId)

    const referenceId = `${event.title} - ${event.startDate.toLocaleDateString()}`

    const items: Item[] = []
    let totalAmount = 0
    const tickets = body.items.map((item) => ({ ticketTypeId: item.ticketTypeId, quantity: item.quantity }))
    for (const { ticketTypeId, quantity } of tickets) {
      const { data: ticketType } = await this.ticketTypesService.getById(ticketTypeId)
      items.push({
        reference_id: ticketTypeId,
        name: ticketType.name,
        quantity: quantity,
        unit_amount: ticketType.price * 100,
      })
      totalAmount += ticketType.price * quantity
    }

    const checkoutBody: CreateCheckout = {
      reference_id: referenceId,
      customer: {
        name: user.name,
        email: user.email,
        tax_id: user.cpf,
      },
      customerModifiable: true,
      items: items,
      redirect_url: `${process.env.PAGBANK_REDIRECT_URL}`,
    }

    const checkout = await this.pagbankService.createCheckout(checkoutBody)
    return { checkout, totalAmount }
  }

  private async createTicket(
    orderId: string,
    userId: string,
    eventId: string,
    body: CreateOrderDto,
  ): Promise<{ qrCodes: string[]; ticketIds: string[] }> {
    const qrCodes: string[] = []
    const ticketIds: string[] = []
    for (const item of body.items) {
      for (let i = 0; i < item.quantity; i++) {
        const qrToken = randomBytes(32).toString('hex')
        const qrCodeHash = createHash('sha256').update(qrToken).digest('hex')
        const qrCodeEncryptedToken = this.encryptQrToken(qrToken)
        const ticket = await this.ticketsService.createTicket({
          orderId,
          userId,
          ticketTypeId: item.ticketTypeId,
          eventId,
          status: TicketStatus.PENDING,
          qrCodeHash,
          qrCodeEncryptedToken,
        })
        qrCodes.push(qrToken)
        ticketIds.push(ticket.id)
      }
    }
    return { qrCodes, ticketIds }
  }

  private encryptQrToken(token: string): string {
    const secret = this.configService.get<string>('QR_CODE_SECRET')
    if (!secret) {
      throw new InternalServerErrorException('Missing QR_CODE_SECRET configuration')
    }

    const key = createHash('sha256').update(secret).digest()
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', key, iv)
    const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
    const authTag = cipher.getAuthTag()

    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`
  }
}
