import { createOrder, getTicketType, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T49 - Pedido pago não decrementa estoque antes do pagamento', () => {
  const ctx = setupE2EApp()

  it('keeps availableQuantity unchanged after creating a pending paid order', async () => {
    const market = await setupMarketplace(ctx.app, { paidQuantity: 3 })
    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.paidTicketTypeId)
    expect(order.status).toBe(201)

    const ticketType = await getTicketType(ctx.app, market.organizer.accessToken, market.paidTicketTypeId)
    expect(ticketType.status).toBe(200)
    expect(Number(ticketType.body.data.availableQuantity)).toBe(3)
  })
})
