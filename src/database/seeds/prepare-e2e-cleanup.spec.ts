import { EntityManager, In, Like, Not } from 'typeorm'
import { clearPreviousE2EData, E2E_EVENT_TITLE_PREFIX } from './prepare-e2e-cleanup'
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

describe('E2E preparation cleanup', () => {
  const userId = 'e2e-user'
  let eventRows: Array<{ id: string }>
  let orderRows: Array<{ id: string }>
  const find = jest.fn<Promise<Array<{ id: string }>>, [unknown, unknown]>()
  const existsBy = jest.fn<Promise<boolean>, [unknown, unknown]>()
  const deleteRecords = jest.fn<Promise<{ affected: number; raw: unknown[] }>, [unknown, unknown]>()
  const manager = { find, existsBy, delete: deleteRecords } as unknown as EntityManager

  beforeEach(() => {
    jest.resetAllMocks()
    eventRows = [{ id: 'previous-e2e-event' }]
    orderRows = [{ id: 'previous-e2e-order' }]
    find.mockImplementation((entity) => Promise.resolve(entity === Events ? eventRows : orderRows))
    existsBy.mockResolvedValue(false)
    deleteRecords.mockResolvedValue({ affected: 1, raw: [] })
  })

  const protectedEntities = [Orders, Tickets, Favorites, EventRatings, EventStaff, EventStaffInvitations, EventChanges]
  test.each(protectedEntities.map((entity) => [entity.name, entity] as const))(
    'aborts before deleting anything when %s belongs to another user',
    async (_, protectedEntity) => {
      existsBy.mockImplementation((entity) => Promise.resolve(entity === protectedEntity))
      await expect(clearPreviousE2EData(manager, userId)).rejects.toThrow('belonging to another user')
      expect(deleteRecords).not.toHaveBeenCalled()
      expect(existsBy).toHaveBeenCalledWith(protectedEntity, {
        eventId: In(['previous-e2e-event']),
        ...(protectedEntity === EventChanges ? { changedByUserId: Not(userId) } : { userId: Not(userId) }),
      })
    },
  )

  it('clears legacy account purchases even when no prepared events remain', async () => {
    eventRows = []
    await clearPreviousE2EData(manager, userId)
    expect(existsBy).not.toHaveBeenCalled()
    for (const entity of [Tickets, Orders, Favorites, EventRatings]) {
      expect(deleteRecords).toHaveBeenCalledWith(entity, { userId })
    }
    expect(deleteRecords).toHaveBeenCalledWith(OrderItems, { orderId: In(['previous-e2e-order']) })
    expect(deleteRecords).not.toHaveBeenCalledWith(Events, expect.anything())
    expect(deleteRecords).not.toHaveBeenCalledWith(TicketTypes, expect.anything())
  })

  it('skips order items when the account has no orders', async () => {
    orderRows = []
    await clearPreviousE2EData(manager, userId)
    expect(deleteRecords).not.toHaveBeenCalledWith(OrderItems, expect.anything())
  })

  it('restricts events to the preparator prefix and account, deleting children before parents', async () => {
    await clearPreviousE2EData(manager, userId)
    expect(find).toHaveBeenCalledWith(Events, {
      select: { id: true },
      where: { organizerId: userId, title: Like(`${E2E_EVENT_TITLE_PREFIX}%`) },
      lock: { mode: 'pessimistic_write' },
    })
    expect(find).toHaveBeenCalledWith(Orders, { select: { id: true }, where: { userId } })
    expect(deleteRecords).toHaveBeenCalledWith(Events, { id: In(['previous-e2e-event']), organizerId: userId })
    const deletionOrder = deleteRecords.mock.calls.map(([entity]) => entity)
    expect(deletionOrder.indexOf(Tickets)).toBeLessThan(deletionOrder.indexOf(Orders))
    expect(deletionOrder.indexOf(OrderItems)).toBeLessThan(deletionOrder.indexOf(Orders))
    expect(deletionOrder.indexOf(Orders)).toBeLessThan(deletionOrder.indexOf(TicketTypes))
    expect(deletionOrder.indexOf(EventStaff)).toBeLessThan(deletionOrder.indexOf(EventStaffInvitations))
    expect(deletionOrder.indexOf(TicketTypes)).toBeLessThan(deletionOrder.indexOf(Events))
    for (const [, criteria] of deleteRecords.mock.calls) expect(criteria).not.toEqual({})
  })
})
