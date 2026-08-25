import request from 'supertest'
import { bearer, createOrder, setupMarketplace } from './helpers/api'
import { errorText } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T29 - Check-in com order não paga', () => {
  const ctx = setupE2EApp()

  it('rejects check-in of pending paid order with 400', async () => {
    const market = await setupMarketplace(ctx.app)
    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.paidTicketTypeId)
    expect(order.status).toBe(201)

    const qrToken = order.body.data.qrCodes[0] as string
    const res = await request(ctx.app.getHttpServer())
      .post(`/api/events/${market.eventId}/checkin`)
      .set(bearer(market.organizer.accessToken))
      .send({ qrToken })

    expect(res.status).toBe(400)
    expect(errorText(res.body).toLowerCase()).toMatch(/order is not paid/)
  })
})
