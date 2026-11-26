import { Injectable } from '@nestjs/common'
import { QueryPaginationDto } from '~/common/pagination/pagination.dto'
import {
  CreateOrderDto,
  OrderDetailsResponseDto,
  OrderResponseDto,
  PaginateMyOrdersDto,
} from '~/modules/orders/dto/orders.dto'
import { OrdersPurchaseService } from '~/modules/orders/orders-purchase.service'
import { OrdersQueryService } from '~/modules/orders/orders-query.service'
import { OrdersWebhookService } from '~/modules/orders/orders-webhook.service'

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersPurchaseService: OrdersPurchaseService,
    private readonly ordersQueryService: OrdersQueryService,
    private readonly ordersWebhookService: OrdersWebhookService,
  ) {}

  async createOrder(userId: string, eventId: string, body: CreateOrderDto): Promise<OrderResponseDto> {
    return this.ordersPurchaseService.createOrder(userId, eventId, body)
  }

  async markAsPaidFromWebhook(checkoutId: string | null, referenceId: string | null): Promise<void> {
    return this.ordersWebhookService.markAsPaidFromWebhook(checkoutId, referenceId)
  }

  async getMyOrders(userId: string, queryParams: QueryPaginationDto): Promise<PaginateMyOrdersDto> {
    return this.ordersQueryService.getMyOrders(userId, queryParams)
  }

  async getOrderById(userId: string, orderId: string): Promise<OrderDetailsResponseDto> {
    return this.ordersQueryService.getOrderById(userId, orderId)
  }
}
