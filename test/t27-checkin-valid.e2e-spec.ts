import request from 'supertest'
import { bearer, createOrder, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'
import { TicketStatus } from '~/modules/tickets/tickets.entity'

describe('T27 - Check-in válido via QR Code', () => {
  const ctx = setupE2EApp()

  it('checks in a paid free ticket as organizer', async () => {
    const market = await setupMarketplace(ctx.app)
    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.freeTicketTypeId)
    expect(order.status).toBe(201)

    const qrToken = order.body.data.qrCodes[0] as string
    const res = await request(ctx.app.getHttpServer())
      .post(`/api/events/${market.eventId}/checkin`)
      .set(bearer(market.organizer.accessToken))
      .send({ qrToken })

    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe(TicketStatus.CHECKED_IN)
  })
})
