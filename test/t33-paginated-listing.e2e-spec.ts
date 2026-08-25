import request from 'supertest'
import { bearer, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'
import { EventStatus } from '~/modules/events-module/events.entity'

describe('T33 - Listagem paginada', () => {
  const ctx = setupE2EApp()

  it('returns paginated events and ticket types with meta', async () => {
    const market = await setupMarketplace(ctx.app)
    const events = await request(ctx.app.getHttpServer())
      .get('/api/events')
      .query({ page: 1, limit: 10, status: EventStatus.OPENED })
      .set(bearer(market.buyer.accessToken))

    expect(events.status).toBe(200)
    expect(Array.isArray(events.body.data)).toBe(true)
    expect(events.body.meta).toBeDefined()
    expect(events.body.meta.totalItems).toEqual(expect.any(Number))
    expect(events.body.meta.totalPages).toEqual(expect.any(Number))
    expect(events.body.meta.currentPage).toBe(1)
    expect(events.body.meta.itemsPerPage).toBe(10)

    const types = await request(ctx.app.getHttpServer())
      .get(`/api/events/${market.eventId}/ticket-types`)
      .query({ page: 1, limit: 10, availableOnly: false })
      .set(bearer(market.buyer.accessToken))

    expect(types.status).toBe(200)
    expect(Array.isArray(types.body.data)).toBe(true)
    expect(types.body.meta.totalItems).toEqual(expect.any(Number))
    expect(types.body.meta.currentPage).toBe(1)
    expect(types.body.meta.itemsPerPage).toBe(10)
  })
})
