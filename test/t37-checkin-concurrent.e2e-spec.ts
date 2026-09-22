import { checkin, createOrder, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T37 - Check-in concorrente do mesmo QR', () => {
  const ctx = setupE2EApp()

  it('accepts exactly one check-in and rejects the other with 409', async () => {
    const market = await setupMarketplace(ctx.app)
    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.freeTicketTypeId)
    expect(order.status).toBe(201)

    const qrToken = order.body.data.qrCodes[0] as string

    const [first, second] = await Promise.all([
      checkin(ctx.app, market.eventId, qrToken, market.organizer.accessToken),
      checkin(ctx.app, market.eventId, qrToken, market.organizer.accessToken),
    ])

    const statuses = [first.status, second.status].sort((a, b) => a - b)
    expect(statuses).toEqual([200, 409])
  })
})
