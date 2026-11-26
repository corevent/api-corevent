import { ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { createPaginationMeta } from '~/common/pagination/pagination-meta.factory'
import { QueryPaginationDto } from '~/common/pagination/pagination.dto'
import { getOffset } from '~/common/utils/get-offset.util'
import { decryptQrToken } from '~/common/utils/qr-code-crypto.util'
import {
  MyOrdersDataDto,
  OrderDetailsDataDto,
  OrderDetailsResponseDto,
  PaginateMyOrdersDto,
} from '~/modules/orders/dto/orders.dto'
import { Orders } from '~/modules/orders/orders.entity'
import { CheckoutResponse } from '~/modules/pagbank/interface/pagbank.interface'
import { PagBankService } from '~/modules/pagbank/pagbank.service'
import { Tickets } from '~/modules/tickets/tickets.entity'
import { TicketsService } from '~/modules/tickets/tickets.service'

@Injectable()
export class OrdersQueryService {
  private readonly logger = new Logger(OrdersQueryService.name)

  constructor(
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    private readonly configService: ConfigService,
    private readonly pagbankService: PagBankService,
    private readonly ticketsService: TicketsService,
  ) {}

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
      order.gatewayTransactionId ? this.fetchCheckout(order.gatewayTransactionId) : Promise.resolve(null),
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
    const checkoutDetails = order.gatewayTransactionId
      ? {
          id: checkout?.id ?? order.gatewayTransactionId,
          status: checkout?.status ?? 'UNKNOWN',
          createdAt: checkout?.created_at ?? order.createdAt.toISOString(),
          checkoutLinks: checkout?.links ?? [],
          ...(gatewayOrderIds?.length ? { gatewayOrderIds } : {}),
        }
      : undefined

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
      ...(checkoutDetails ? { checkout: checkoutDetails } : {}),
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
