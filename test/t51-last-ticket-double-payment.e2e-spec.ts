import {
  createOrder,
  getOrder,
  getTicketType,
  paidWebhookPayload,
  postPagBankWebhook,
  registerAndLogin,
  setupMarketplace,
  signWebhook,
} from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'
import { OrderStatus } from '~/modules/orders/orders.entity'

describe('T51 - Dois pedidos para o último ingresso', () => {
  const ctx = setupE2EApp()

  it('reserves the last ticket for the first pending order and rejects the second buyer', async () => {
    const market = await setupMarketplace(ctx.app, { paidQuantity: 1 })
    const secondBuyer = await registerAndLogin(ctx.app)

    const firstOrder = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.paidTicketTypeId)
    const secondOrder = await createOrder(ctx.app, secondBuyer.accessToken, market.eventId, market.paidTicketTypeId)
    expect(firstOrder.status).toBe(201)
    expect(secondOrder.status).toBe(400)

    const firstBody = paidWebhookPayload(firstOrder.body.data.orderId as string)
    await postPagBankWebhook(ctx.app, firstBody, signWebhook(firstBody))

    const firstDetails = await getOrder(ctx.app, market.buyer.accessToken, firstOrder.body.data.orderId)
    expect(firstDetails.status).toBe(200)
    expect(firstDetails.body.data.status).toBe(OrderStatus.PAID)
    expect(firstDetails.body.data.tickets).toHaveLength(1)

    const ticketType = await getTicketType(ctx.app, market.organizer.accessToken, market.paidTicketTypeId)
    expect(ticketType.status).toBe(200)
    expect(Number(ticketType.body.data.availableQuantity)).toBe(0)
  })
})
