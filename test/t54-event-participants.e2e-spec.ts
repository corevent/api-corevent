import request from 'supertest'
import { bearer, createOrder, registerAndLogin, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T54 - Listagem e detalhes de participantes', () => {
  const ctx = setupE2EApp()

  it('lists participants and returns ticket details for organizer', async () => {
    const market = await setupMarketplace(ctx.app)
    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.freeTicketTypeId)
    expect(order.status).toBe(201)

    const list = await request(ctx.app.getHttpServer())
      .get(`/api/events/${market.eventId}/participants`)
      .query({ page: 1, limit: 10 })
      .set(bearer(market.organizer.accessToken))

    expect(list.status).toBe(200)
    expect(list.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: market.buyer.id,
          email: market.buyer.email,
          ticketsCount: expect.any(Number),
        }),
      ]),
    )
    expect(list.body.meta.totalItems).toBeGreaterThanOrEqual(1)

    const details = await request(ctx.app.getHttpServer())
      .get(`/api/events/${market.eventId}/participants/${market.buyer.id}/details`)
      .set(bearer(market.organizer.accessToken))

    expect(details.status).toBe(200)
    expect(details.body.data.user.id).toBe(market.buyer.id)
    expect(details.body.data.tickets.length).toBeGreaterThan(0)
    expect(details.body.data.tickets[0].ticketType.name).toBeDefined()
  })

  it('rejects participants access for users without staff permission', async () => {
    const market = await setupMarketplace(ctx.app)
    const stranger = await registerAndLogin(ctx.app)

    const list = await request(ctx.app.getHttpServer())
      .get(`/api/events/${market.eventId}/participants`)
      .query({ page: 1, limit: 10 })
      .set(bearer(stranger.accessToken))

    expect(list.status).toBe(403)
  })

  it('returns 404 when participant has no tickets for the event', async () => {
    const market = await setupMarketplace(ctx.app)
    const stranger = await registerAndLogin(ctx.app)

    const details = await request(ctx.app.getHttpServer())
      .get(`/api/events/${market.eventId}/participants/${stranger.id}/details`)
      .set(bearer(market.organizer.accessToken))

    expect(details.status).toBe(404)
  })
})
