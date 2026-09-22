import { createOrder, setupMarketplace } from './helpers/api'
import { errorText } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T20 - Compra com quantidade maior que o estoque', () => {
  const ctx = setupE2EApp()

  it('rejects oversell with 400', async () => {
    const market = await setupMarketplace(ctx.app, { paidQuantity: 1 })
    const res = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.paidTicketTypeId, 2)

    expect(res.status).toBe(400)
    expect(errorText(res.body).toLowerCase()).toMatch(/not enough tickets available/)
  })
})
