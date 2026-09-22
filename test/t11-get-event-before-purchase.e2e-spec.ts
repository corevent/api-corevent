import request from 'supertest'
import { bearer, registerAndLogin, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T11 - Consultar detalhes do evento antes da compra', () => {
  const ctx = setupE2EApp()

  it('returns event details and ticket types', async () => {
    const market = await setupMarketplace(ctx.app)
    const visitor = await registerAndLogin(ctx.app)

    const event = await request(ctx.app.getHttpServer())
      .get(`/api/events/${market.eventId}`)
      .set(bearer(visitor.accessToken))

    expect(event.status).toBe(200)
    expect(event.body.data.title).toBe(market.title)
    expect(event.body.data.startDate).toBeDefined()

    const types = await request(ctx.app.getHttpServer())
      .get(`/api/events/${market.eventId}/ticket-types`)
      .query({ page: 1, limit: 10, availableOnly: false })
      .set(bearer(visitor.accessToken))

    expect(types.status).toBe(200)
    expect(types.body.data.length).toBeGreaterThan(0)
  })
})
