import request from 'supertest'
import { bearer, createOrder, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T56 - Meus ingressos por evento', () => {
  const ctx = setupE2EApp()

  it('returns buyer tickets scoped to a single event', async () => {
    const market = await setupMarketplace(ctx.app)
    const other = await setupMarketplace(ctx.app)

    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.freeTicketTypeId)
    expect(order.status).toBe(201)

    const forEvent = await request(ctx.app.getHttpServer())
      .get(`/api/events/${market.eventId}/my/tickets`)
      .set(bearer(market.buyer.accessToken))

    expect(forEvent.status).toBe(200)
    expect(forEvent.body.data.length).toBe(1)
    expect(forEvent.body.data[0].eventId).toBe(market.eventId)
    expect(forEvent.body.data[0].qrToken).toEqual(expect.any(String))

    const otherEvent = await request(ctx.app.getHttpServer())
      .get(`/api/events/${other.eventId}/my/tickets`)
      .set(bearer(market.buyer.accessToken))

    expect(otherEvent.status).toBe(200)
    expect(otherEvent.body.data).toEqual([])
  })
})
