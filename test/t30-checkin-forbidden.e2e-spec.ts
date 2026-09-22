import request from 'supertest'
import { bearer, createOrder, registerAndLogin, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T30 - Check-in sem permissão', () => {
  const ctx = setupE2EApp()

  it('rejects check-in from non-staff user with 403', async () => {
    const market = await setupMarketplace(ctx.app)
    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.freeTicketTypeId)
    expect(order.status).toBe(201)

    const qrToken = order.body.data.qrCodes[0] as string
    const stranger = await registerAndLogin(ctx.app)

    const res = await request(ctx.app.getHttpServer())
      .post(`/api/events/${market.eventId}/checkin`)
      .set(bearer(stranger.accessToken))
      .send({ qrToken })

    expect(res.status).toBe(403)
  })
})
