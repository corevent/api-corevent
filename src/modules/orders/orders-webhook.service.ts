import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { OrderItems } from '~/modules/orders/order-items.entity'
import { OrdersPurchaseService } from '~/modules/orders/orders-purchase.service'
import { Orders, OrderStatus } from '~/modules/orders/orders.entity'

@Injectable()
export class OrdersWebhookService {
  private readonly logger = new Logger(OrdersWebhookService.name)

  constructor(
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    private readonly ordersPurchaseService: OrdersPurchaseService,
    private readonly dataSource: DataSource,
  ) {}

  async markAsPaidFromWebhook(checkoutId: string | null, referenceId: string | null): Promise<void> {
    const order = await this.findOrderForWebhook(checkoutId, referenceId)

    if (!order) {
      this.logger.warn(`Order not found for webhook checkoutId=${checkoutId} referenceId=${referenceId}`)
      return
    }

    if (
      order.status === OrderStatus.PAID ||
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.FAILED ||
      order.status === OrderStatus.PENDING_REFUND
    ) {
      this.logger.log(`Webhook skipped: order ${order.id} already has status ${order.status}`)
      return
    }

    const wasFulfilled = await this.fulfillPaidOrder(order.id)
    if (wasFulfilled) {
      this.logger.log(`Order ${order.id} marked as PAID via webhook`)
    }
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

  private async fulfillPaidOrder(orderId: string): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Orders, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      })

      if (!order || order.status !== OrderStatus.PENDING) {
        return false
      }

      const items = await manager.find(OrderItems, { where: { orderId } })
      if (items.length === 0) {
        throw new InternalServerErrorException('Paid order has no items')
      }

      await this.ordersPurchaseService.createTickets(order.id, order.userId, order.eventId, items, manager)
      await manager.update(Orders, order.id, { status: OrderStatus.PAID })
      return true
    })
  }
}
