import { createOrder, getOrder, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'
import { OrderStatus } from '~/modules/orders/orders.entity'
import { TicketStatus } from '~/modules/tickets/tickets.entity'

describe('T21 - Compra de ingresso pago (checkout PagBank)', () => {
  const ctx = setupE2EApp()

  it('creates pending order with checkout links and pending tickets', async () => {
    const market = await setupMarketplace(ctx.app)
    const res = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.paidTicketTypeId)

    expect(res.status).toBe(201)
    expect(res.body.data.checkoutLinks.length).toBeGreaterThan(0)
    expect(res.body.data.ticketIds.length).toBeGreaterThan(0)

    const details = await getOrder(ctx.app, market.buyer.accessToken, res.body.data.orderId)
    expect(details.status).toBe(200)
    expect(details.body.data.status).toBe(OrderStatus.PENDING)
    expect(details.body.data.tickets[0].status).toBe(TicketStatus.PENDING)
  })
})
