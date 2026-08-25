import { createOrder, setupMarketplace } from './helpers/api'
import { errorText } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T19 - Compra gratuita duplicada do mesmo tipo', () => {
  const ctx = setupE2EApp()

  it('rejects second free ticket of the same type with 400', async () => {
    const market = await setupMarketplace(ctx.app)
    const first = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.freeTicketTypeId)
    expect(first.status).toBe(201)

    const second = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.freeTicketTypeId)
    expect(second.status).toBe(400)
    expect(errorText(second.body).toLowerCase()).toMatch(/already have a ticket/)
  })
})
