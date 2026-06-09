import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { createHash, randomBytes, randomUUID } from 'crypto'
import { DataSource, Repository } from 'typeorm'
import { createPaginationMeta } from '~/common/pagination/pagination-meta.factory'
import { QueryPaginationDto } from '~/common/pagination/pagination.dto'
import { getOffset } from '~/common/utils/get-offset.util'
import { decryptQrToken, encryptQrToken } from '~/common/utils/qr-code-crypto.util'
import {
  CheckoutDataDto,
  CreateOrderDto,
  MyOrdersDataDto,
  OrderDetailsDataDto,
  OrderDetailsResponseDto,
  OrderResponseDto,
  PaginateMyOrdersDto,
} from '~/modules/orders/dto/orders.dto'
import { Orders, OrderStatus } from '~/modules/orders/orders.entity'
import { CheckoutResponse, CreateCheckout, Item } from '~/modules/pagbank/interface/pagbank.interface'
import { PagBankService } from '~/modules/pagbank/pagbank.service'
import { TicketTypesService } from '~/modules/ticket-types/ticket-types.service'
import { Tickets, TicketStatus } from '~/modules/tickets/tickets.entity'
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

  async getMyOrders(userId: string, queryParams: QueryPaginationDto): Promise<PaginateMyOrdersDto> {
    const { page, limit } = queryParams
    const [data, total] = await this.ordersRepository.findAndCount({
      where: { userId },
      skip: getOffset(page, limit),
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['event'],
    })

    return {
      data: plainToInstance(MyOrdersDataDto, data, { excludeExtraneousValues: true }),
      meta: createPaginationMeta(page, limit, total),
    }
  }

  async getOrderById(userId: string, orderId: string): Promise<OrderDetailsResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['event'],
    })

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not own this order')
    }

    const [tickets, checkout] = await Promise.all([
      this.ticketsService.getByOrderId(orderId),
      this.fetchCheckout(order.gatewayTransactionId),
    ])

    return {
      data: this.mapOrderDetails(order, tickets, checkout),
    }
  }

  private async fetchCheckout(checkoutId: string): Promise<CheckoutResponse | null> {
    try {
      return await this.pagbankService.getCheckoutById(checkoutId)
    } catch (error) {
      this.logger.warn(`Failed to fetch PagBank checkout ${checkoutId}`, error)
      return null
    }
  }

  private mapOrderDetails(order: Orders, tickets: Tickets[], checkout: CheckoutResponse | null): OrderDetailsDataDto {
    const gatewayOrderIds = checkout?.orders?.map((gatewayOrder) => gatewayOrder.id)

    return plainToInstance(OrderDetailsDataDto, {
      id: order.id,
      eventId: order.eventId,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
      event: {
        id: order.event.id,
        title: order.event.title,
        startDate: order.event.startDate,
        endDate: order.event.endDate,
      },
      checkout: {
        id: checkout?.id ?? order.gatewayTransactionId,
        status: checkout?.status ?? 'UNKNOWN',
        createdAt: checkout?.created_at ?? order.createdAt.toISOString(),
        checkoutLinks: checkout?.links ?? [],
        ...(gatewayOrderIds?.length ? { gatewayOrderIds } : {}),
      },
      tickets: tickets.map((ticket) => ({
        id: ticket.id,
        ticketTypeId: ticket.ticketTypeId,
        status: ticket.status,
        checkinAt: ticket.checkinAt,
        qrToken: this.decryptQrToken(ticket.qrCodeEncryptedToken),
        ticketType: {
          id: ticket.ticketType.id,
          name: ticket.ticketType.name,
          price: Number(ticket.ticketType.price),
        },
      })),
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

    return encryptQrToken(token, secret)
  }

  private decryptQrToken(encryptedToken: string): string {
    const secret = this.configService.get<string>('QR_CODE_SECRET')
    if (!secret) {
      throw new InternalServerErrorException('Missing QR_CODE_SECRET configuration')
    }

    try {
      return decryptQrToken(encryptedToken, secret)
    } catch {
      throw new InternalServerErrorException('Invalid QR code encrypted token format')
    }
  }
}
