import { checkin, createOrder, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T39 - Check-in sem autenticação', () => {
  const ctx = setupE2EApp()

  it('rejects check-in without JWT with 401', async () => {
    const market = await setupMarketplace(ctx.app)
    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.freeTicketTypeId)
    expect(order.status).toBe(201)

    const qrToken = order.body.data.qrCodes[0] as string
    const res = await checkin(ctx.app, market.eventId, qrToken)

    expect(res.status).toBe(401)
  })
})
