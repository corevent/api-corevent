import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { createHash, randomBytes, randomUUID } from 'crypto'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { encryptQrToken } from '~/common/utils/qr-code-crypto.util'
import { CheckoutDataDto, CreateOrderDto, OrderResponseDto } from '~/modules/orders/dto/orders.dto'
import { OrderItems } from '~/modules/orders/order-items.entity'
import { OrdersPurchaseValidationService } from '~/modules/orders/orders-purchase-validation.service'
import { Orders, OrderStatus } from '~/modules/orders/orders.entity'
import { CheckoutResponse, CreateCheckout, Item } from '~/modules/pagbank/interface/pagbank.interface'
import { PagBankService } from '~/modules/pagbank/pagbank.service'
import { TicketTypes } from '~/modules/ticket-types/ticket-types.entity'
import { TicketTypesService } from '~/modules/ticket-types/ticket-types.service'
import { TicketStatus } from '~/modules/tickets/tickets.entity'
import { TicketsService } from '~/modules/tickets/tickets.service'
import { UsersService } from '~/modules/users/users.service'

export type OrderLineItem = {
  ticketTypeId: string
  quantity: number
}

@Injectable()
export class OrdersPurchaseService {
  constructor(
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    private readonly configService: ConfigService,
    private readonly ticketTypesService: TicketTypesService,
    private readonly pagbankService: PagBankService,
    private readonly usersService: UsersService,
    private readonly ticketsService: TicketsService,
    private readonly validationService: OrdersPurchaseValidationService,
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(userId: string, eventId: string, body: CreateOrderDto): Promise<OrderResponseDto> {
    this.validationService.assertNoDuplicateTicketTypes(body.items)
    await this.validationService.validatePurchaseEligibility(userId, eventId, body.items)
    await this.validationService.validateTicketAvailability(body.items)
    await this.validationService.validateFreeTicketRules(userId, body.items)

    const orderId = randomUUID()
    const { items, totalAmount, areAllItemsFree } = await this.validationService.buildOrderItems(body)

    if (areAllItemsFree) {
      return this.createFreeOrder(userId, eventId, body, orderId)
    }

    await this.savePendingPaidOrder(orderId, userId, eventId, totalAmount, null, body.items)

    try {
      await this.dataSource.transaction(async (manager) => {
        await this.ticketTypesService.decreaseAvailableQuantity(body.items, manager)
      })
    } catch (error) {
      await this.ordersRepository.update(orderId, { status: OrderStatus.CANCELLED })
      throw error
    }

    try {
      const { checkout, checkoutLinks } = await this.createCheckout(userId, items, orderId)
      await this.ordersRepository.update(orderId, { gatewayTransactionId: checkout.id })
      return { data: { orderId, checkoutLinks, qrCodes: [], ticketIds: [] } }
    } catch (error) {
      await this.ticketTypesService.increaseAvailableQuantity(body.items)
      await this.ordersRepository.update(orderId, { status: OrderStatus.CANCELLED })
      throw error
    }
  }

  async createTickets(
    orderId: string,
    userId: string,
    eventId: string,
    items: OrderLineItem[],
    manager?: EntityManager,
  ): Promise<{ qrCodes: string[]; ticketIds: string[] }> {
    const qrCodes: string[] = []
    const ticketIds: string[] = []
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        const qrToken = randomBytes(32).toString('hex')
        const qrCodeHash = createHash('sha256').update(qrToken).digest('hex')
        const qrCodeEncryptedToken = this.encryptQrToken(qrToken)
        const ticket = await this.ticketsService.createTicket(
          {
            orderId,
            userId,
            ticketTypeId: item.ticketTypeId,
            eventId,
            status: TicketStatus.PENDING,
            qrCodeHash,
            qrCodeEncryptedToken,
          },
          manager,
        )
        qrCodes.push(qrToken)
        ticketIds.push(ticket.id)
      }
    }
    return { qrCodes, ticketIds }
  }

  private async createFreeOrder(
    userId: string,
    eventId: string,
    body: CreateOrderDto,
    orderId: string,
  ): Promise<OrderResponseDto> {
    const ticketTypeQuantities = body.items.map(({ ticketTypeId, quantity }) => ({ ticketTypeId, quantity }))

    const { qrCodes, ticketIds } = await this.dataSource.transaction(async (manager) => {
      for (const item of body.items) {
        const ticketType = await manager.findOne(TicketTypes, {
          where: { id: item.ticketTypeId },
          lock: { mode: 'pessimistic_write' },
        })
        if (!ticketType) {
          throw new BadRequestException('Ticket type not found')
        }

        const hasExistingTicket = await this.ticketsService.hasUserTicketForTicketType(
          userId,
          item.ticketTypeId,
          manager,
        )
        if (hasExistingTicket) {
          throw new BadRequestException(`You already have a ticket for "${ticketType.name}"`)
        }
      }

      await manager.save(Orders, {
        id: orderId,
        userId,
        eventId,
        totalAmount: 0,
        status: OrderStatus.PAID,
        gatewayTransactionId: null,
      })

      await this.ticketTypesService.decreaseAvailableQuantity(ticketTypeQuantities, manager)
      return this.createTickets(orderId, userId, eventId, body.items, manager)
    })

    return { data: { orderId, checkoutLinks: [], qrCodes, ticketIds } }
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
        tax_id: user.document.trim(),
      },
      customerModifiable: true,
      items,
      redirect_url: redirectUrl,
      ...(webhookUrl ? { notification_urls: [webhookUrl] } : {}),
    }

    const checkout = await this.pagbankService.createCheckout(checkoutBody)
    return { checkout, checkoutLinks: checkout.links }
  }

  private async savePendingPaidOrder(
    orderId: string,
    userId: string,
    eventId: string,
    totalAmount: number,
    gatewayTransactionId: string | null,
    items: OrderLineItem[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.save(Orders, {
        id: orderId,
        userId,
        eventId,
        totalAmount,
        status: OrderStatus.PENDING,
        gatewayTransactionId,
      })
      await manager.save(
        OrderItems,
        items.map((item) => ({
          orderId,
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
        })),
      )
    })
  }

  private encryptQrToken(token: string): string {
    const secret = this.configService.get<string>('QR_CODE_SECRET')
    if (!secret) {
      throw new InternalServerErrorException('Missing QR_CODE_SECRET configuration')
    }

    return encryptQrToken(token, secret)
  }
}
