import request from 'supertest'
import { bearer, createOrder, setupMarketplace } from './helpers/api'
import { errorText } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T28 - Check-in duplicado do mesmo QR', () => {
  const ctx = setupE2EApp()

  it('rejects second check-in with 409', async () => {
    const market = await setupMarketplace(ctx.app)
    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.freeTicketTypeId)
    expect(order.status).toBe(201)

    const qrToken = order.body.data.qrCodes[0] as string

    const first = await request(ctx.app.getHttpServer())
      .post(`/api/events/${market.eventId}/checkin`)
      .set(bearer(market.organizer.accessToken))
      .send({ qrToken })
    expect(first.status).toBe(200)

    const res = await request(ctx.app.getHttpServer())
      .post(`/api/events/${market.eventId}/checkin`)
      .set(bearer(market.organizer.accessToken))
      .send({ qrToken })

    expect(res.status).toBe(409)
    expect(errorText(res.body).toLowerCase()).toMatch(/already checked in/)
  })
})
