import { createOrder, getOrder, registerAndLogin, setupMarketplace } from './helpers/api'
import { errorText } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T23 - Ver ingresso de outro usuário', () => {
  const ctx = setupE2EApp()

  it('forbids access to another user order with 403', async () => {
    const market = await setupMarketplace(ctx.app)
    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.freeTicketTypeId)
    expect(order.status).toBe(201)

    const stranger = await registerAndLogin(ctx.app)
    const res = await getOrder(ctx.app, stranger.accessToken, order.body.data.orderId)

    expect(res.status).toBe(403)
    expect(errorText(res.body).toLowerCase()).toMatch(/do not own this order/)
  })
})
