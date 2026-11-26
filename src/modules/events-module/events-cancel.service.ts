import { BadRequestException, Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { EventChangesService } from '~/modules/event-changes/event-changes.service'
import { EventDataDto } from '~/modules/events-module/dto/events.dto'
import { Events, EventStatus } from '~/modules/events-module/events.entity'
import { EventsQueryService } from '~/modules/events-module/events-query.service'
import { OrderItems } from '~/modules/orders/order-items.entity'
import { Orders, OrderStatus } from '~/modules/orders/orders.entity'
import { TicketTypesService } from '~/modules/ticket-types/ticket-types.service'
import { Tickets, TicketStatus } from '~/modules/tickets/tickets.entity'

@Injectable()
export class EventsCancelService {
  private readonly logger = new Logger(EventsCancelService.name)

  constructor(
    private readonly eventsQueryService: EventsQueryService,
    private readonly eventChangesService: EventChangesService,
    @Inject(forwardRef(() => TicketTypesService))
    private readonly ticketTypesService: TicketTypesService,
    private readonly dataSource: DataSource,
  ) {}

  async cancel(organizerId: string, id: string): Promise<void> {
    const { data: event } = await this.eventsQueryService.getById(id)
    this.validateOrganizer(organizerId, event)

    if (event.status === EventStatus.OPENED || event.status === EventStatus.GOING) {
      await this.cancelOpenedOrGoingEvent(organizerId, id, event)
      return
    }

    const statusMessage = {
      [EventStatus.DRAFT]: 'Event cannot be cancelled because it is draft, delete instead',
      [EventStatus.FINISHED]: 'Event cannot be cancelled because it is finished',
      [EventStatus.CANCELED]: 'Event already cancelled',
    }
    throw new BadRequestException(statusMessage[event.status])
  }

  private async cancelOpenedOrGoingEvent(organizerId: string, id: string, event: EventDataDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.update(Events, id, { status: EventStatus.CANCELED })

      const pendingOrders = await manager.find(Orders, {
        where: { eventId: id, status: OrderStatus.PENDING },
      })
      for (const order of pendingOrders) {
        const items = await manager.find(OrderItems, { where: { orderId: order.id } })
        if (items.length > 0) {
          await this.ticketTypesService.increaseAvailableQuantity(items, manager)
        }
        await manager.update(Orders, order.id, { status: OrderStatus.CANCELLED })
      }

      const paidOrders = await manager.find(Orders, {
        where: { eventId: id, status: OrderStatus.PAID },
      })
      for (const order of paidOrders) {
        await manager.update(Orders, order.id, { status: OrderStatus.PENDING_REFUND })
        this.logger.warn(
          [
            'Event cancelled: paid order marked pending_refund',
            `orderId=${order.id}`,
            `checkoutId=${order.gatewayTransactionId ?? 'none'}`,
            'TODO: call PagBank refund API for this charge',
          ].join(' '),
        )
      }

      await manager
        .createQueryBuilder()
        .update(Tickets)
        .set({ status: TicketStatus.CANCELLED })
        .where('event_id = :eventId', { eventId: id })
        .andWhere('status = :pendingStatus', { pendingStatus: TicketStatus.PENDING })
        .execute()
    })

    await this.eventChangesService.create(organizerId, id, {
      changedFields: ['status'],
      oldValue: { status: event.status },
      newValue: { status: EventStatus.CANCELED },
    })
  }

  private validateOrganizer(organizerId: string, event: EventDataDto): void {
    if (event.organizer.id !== organizerId) {
      throw new BadRequestException('You are not the organizer of this event')
    }
  }
}
