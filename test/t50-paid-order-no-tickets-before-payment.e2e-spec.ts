import { createOrder, getOrder, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T50 - Pedido pago não cria tickets antes do pagamento', () => {
  const ctx = setupE2EApp()

  it('does not persist tickets until the order is paid', async () => {
    const market = await setupMarketplace(ctx.app)
    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.paidTicketTypeId)
    expect(order.status).toBe(201)
    expect(order.body.data.ticketIds).toEqual([])

    const details = await getOrder(ctx.app, market.buyer.accessToken, order.body.data.orderId)
    expect(details.status).toBe(200)
    expect(details.body.data.tickets).toEqual([])
  })
})
