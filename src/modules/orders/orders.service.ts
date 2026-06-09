import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { createCipheriv, createHash, randomBytes, randomUUID } from 'crypto'
import { DataSource, Repository } from 'typeorm'
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
  private readonly logger = new Logger(OrdersService.name)

  constructor(
    @InjectRepository(Orders)
    private ordersRepository: Repository<Orders>,
    private configService: ConfigService,
    private ticketTypesService: TicketTypesService,
    private pagbankService: PagBankService,
    private usersService: UsersService,
    private ticketsService: TicketsService,
    private dataSource: DataSource,
  ) {}

  async createOrder(userId: string, eventId: string, body: CreateOrderDto): Promise<OrderResponseDto> {
    await this.validateTicketAvailability(body.items)
    const orderId = randomUUID()
    const { items, totalAmount } = await this.buildOrderItems(body)
    const { checkout, checkoutLinks } = await this.createCheckout(userId, items, orderId)

    await this.ordersRepository.save({
      id: orderId,
      userId,
      eventId,
      totalAmount,
      status: OrderStatus.PENDING,
      gatewayTransactionId: checkout.id,
    })

    const { qrCodes, ticketIds } = await this.createTicket(orderId, userId, eventId, body)
    return { data: { orderId, checkoutLinks, qrCodes, ticketIds } }
  }

  async markAsPaidFromWebhook(checkoutId: string | null, referenceId: string | null): Promise<void> {
    const order = await this.findOrderForWebhook(checkoutId, referenceId)

    if (!order) {
      this.logger.warn(`Order not found for webhook checkoutId=${checkoutId} referenceId=${referenceId}`)
      return
    }

    if (order.status === OrderStatus.PAID || order.status === OrderStatus.CANCELLED) {
      return
    }

    const ticketTypeQuantities = await this.ticketsService.getTicketTypeQuantitiesByOrderId(order.id)

    await this.dataSource.transaction(async (manager) => {
      await this.ticketTypesService.decreaseAvailableQuantity(ticketTypeQuantities, manager)
      await manager.update(Orders, order.id, { status: OrderStatus.PAID })
    })
  }

  private async findOrderForWebhook(checkoutId: string | null, referenceId: string | null): Promise<Orders | null> {
    if (checkoutId) {
      const orderByCheckout = await this.ordersRepository.findOne({
        where: { gatewayTransactionId: checkoutId },
      })
      if (orderByCheckout) {
        return orderByCheckout
      }
    }

    if (referenceId) {
      return this.ordersRepository.findOne({ where: { id: referenceId } })
    }

    return null
  }

  private async validateTicketAvailability(items: CreateOrderDto['items']): Promise<void> {
    const quantityByTicketType = items.reduce<Map<string, number>>((acc, item) => {
      acc.set(item.ticketTypeId, (acc.get(item.ticketTypeId) ?? 0) + item.quantity)
      return acc
    }, new Map())

    for (const [ticketTypeId, quantity] of quantityByTicketType) {
      const { data: ticketType } = await this.ticketTypesService.getById(ticketTypeId)
      if (ticketType.availableQuantity < quantity) {
        throw new BadRequestException(`Not enough tickets available for ${ticketType.name}`)
      }
    }
  }

  private async buildOrderItems(body: CreateOrderDto): Promise<{ items: Item[]; totalAmount: number }> {
    const items: Item[] = []
    let totalAmount = 0

    for (const { ticketTypeId, quantity } of body.items) {
      const { data: ticketType } = await this.ticketTypesService.getById(ticketTypeId)
      items.push({
        reference_id: ticketTypeId,
        name: ticketType.name,
        quantity,
        unit_amount: ticketType.price * 100,
      })
      totalAmount += ticketType.price * quantity
    }

    return { items, totalAmount }
  }

  private async createCheckout(
    userId: string,
    items: Item[],
    orderId: string,
  ): Promise<{ checkout: CheckoutResponse; checkoutLinks: CheckoutDataDto[] }> {
    const { data: user } = await this.usersService.getById(userId)
    const webhookUrl = this.configService.get<string>('PAGBANK_WEBHOOK_URL')
    const redirectUrl = this.configService.get<string>('PAGBANK_REDIRECT_URL')

    if (!redirectUrl) {
      throw new InternalServerErrorException('Missing PAGBANK_REDIRECT_URL configuration')
    }

    const checkoutBody: CreateCheckout = {
      reference_id: orderId,
      customer: {
        name: user.name,
        email: user.email,
        tax_id: user.cpf,
      },
      customerModifiable: true,
      items,
      redirect_url: redirectUrl,
      ...(webhookUrl ? { notification_urls: [webhookUrl] } : {}),
    }

    const checkout = await this.pagbankService.createCheckout(checkoutBody)
    return { checkout, checkoutLinks: checkout.links }
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
