import { createOrder, getOrder, getTicketType, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'
import { OrderStatus } from '~/modules/orders/orders.entity'

describe('T18 - Compra de ingresso gratuito (1 unidade)', () => {
  const ctx = setupE2EApp()

  it('marks order as paid and decrements stock by 1', async () => {
    const market = await setupMarketplace(ctx.app, { freeQuantity: 5 })
    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.freeTicketTypeId)

    expect(order.status).toBe(201)
    expect(order.body.data.ticketIds).toHaveLength(1)

    const details = await getOrder(ctx.app, market.buyer.accessToken, order.body.data.orderId)
    expect(details.status).toBe(200)
    expect(details.body.data.status).toBe(OrderStatus.PAID)

    const ticketType = await getTicketType(ctx.app, market.organizer.accessToken, market.freeTicketTypeId)
    expect(ticketType.status).toBe(200)
    expect(Number(ticketType.body.data.availableQuantity)).toBe(4)
  })
})
