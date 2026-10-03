import { EntityManager, In, Like, Not } from 'typeorm'
import { Attractions } from '~/modules/attractions/attractions.entity'
import { EventChanges } from '~/modules/event-changes/event-changes.entity'
import { EventRatings } from '~/modules/event-ratings/event-ratings.entity'
import { EventStaffInvitations } from '~/modules/event-staff-invitations/event-staff-invitations.entity'
import { EventStaff } from '~/modules/event-staff/event-staff.entity'
import { Events } from '~/modules/events-module/events.entity'
import { Favorites } from '~/modules/favorites/favorites.entity'
import { OrderItems } from '~/modules/orders/order-items.entity'
import { Orders } from '~/modules/orders/orders.entity'
import { TicketTypes } from '~/modules/ticket-types/ticket-types.entity'
import { Tickets } from '~/modules/tickets/tickets.entity'

export const E2E_EVENT_TITLE_PREFIX = 'Corevent Mobile E2E '

// Called inside the preparation transaction, after upserting the dedicated account.
export async function clearPreviousE2EData(manager: EntityManager, userId: string): Promise<void> {
  const events = await manager.find(Events, {
    select: { id: true },
    where: { organizerId: userId, title: Like(`${E2E_EVENT_TITLE_PREFIX}%`) },
    lock: { mode: 'pessimistic_write' },
  })
  const eventIds = events.map((event) => event.id)

  if (eventIds.length > 0) {
    // Never erase purchases or interactions belonging to another account.
    for (const entity of [Orders, Tickets, Favorites, EventRatings, EventStaff, EventStaffInvitations]) {
      if (
        await manager.existsBy<{ eventId: string; userId: string }>(entity, {
          eventId: In(eventIds),
          userId: Not(userId),
        })
      ) {
        throw new Error('An E2E event contains data belonging to another user; preparation aborted')
      }
    }
    if (await manager.existsBy(EventChanges, { eventId: In(eventIds), changedByUserId: Not(userId) })) {
      throw new Error('An E2E event contains data belonging to another user; preparation aborted')
    }
  }

  // Clear all purchases of the dedicated account, including legacy incompatible QR tokens.
  const orders = await manager.find(Orders, { select: { id: true }, where: { userId } })
  await manager.delete(Tickets, { userId })
  if (orders.length > 0) await manager.delete(OrderItems, { orderId: In(orders.map((order) => order.id)) })
  await manager.delete(Orders, { userId })
  await manager.delete(Favorites, { userId })
  await manager.delete(EventRatings, { userId })

  if (eventIds.length === 0) return
  await manager.delete(EventStaff, { eventId: In(eventIds), userId })
  await manager.delete(EventStaffInvitations, { eventId: In(eventIds), userId })
  await manager.delete(EventChanges, { eventId: In(eventIds), changedByUserId: userId })
  await manager.delete(Attractions, { eventId: In(eventIds) })
  await manager.delete(TicketTypes, { eventId: In(eventIds) })
  await manager.delete(Events, { id: In(eventIds), organizerId: userId })
}
