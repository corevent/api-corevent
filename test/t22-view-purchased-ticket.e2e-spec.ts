import request from 'supertest'
import { bearer, createOrder, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T22 - Ver informações do ingresso comprado', () => {
  const ctx = setupE2EApp()

  it('lists purchased ticket with event, type, status and qrToken', async () => {
    const market = await setupMarketplace(ctx.app)
    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.freeTicketTypeId)
    expect(order.status).toBe(201)

    const res = await request(ctx.app.getHttpServer())
      .get('/api/users/me/tickets')
      .query({ page: 1, limit: 10 })
      .set(bearer(market.buyer.accessToken))

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data[0].event.title).toBeDefined()
    expect(res.body.data[0].ticketType.name).toBeDefined()
    expect(res.body.data[0].status).toBeDefined()
    expect(res.body.data[0].qrToken).toEqual(expect.any(String))
  })
})
