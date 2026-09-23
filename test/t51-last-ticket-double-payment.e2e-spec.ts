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

describe('T51 - Dois pagamentos para o último ingresso', () => {
  const ctx = setupE2EApp()

  it('allows only one PAID order and never makes stock negative', async () => {
    const market = await setupMarketplace(ctx.app, { paidQuantity: 1 })
    const secondBuyer = await registerAndLogin(ctx.app)

    const firstOrder = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.paidTicketTypeId)
    const secondOrder = await createOrder(ctx.app, secondBuyer.accessToken, market.eventId, market.paidTicketTypeId)
    expect(firstOrder.status).toBe(201)
    expect(secondOrder.status).toBe(201)

    const firstBody = paidWebhookPayload(firstOrder.body.data.orderId as string)
    const secondBody = paidWebhookPayload(secondOrder.body.data.orderId as string)

    await Promise.all([
      postPagBankWebhook(ctx.app, firstBody, signWebhook(firstBody)),
      postPagBankWebhook(ctx.app, secondBody, signWebhook(secondBody)),
    ])

    const firstDetails = await getOrder(ctx.app, market.buyer.accessToken, firstOrder.body.data.orderId)
    const secondDetails = await getOrder(ctx.app, secondBuyer.accessToken, secondOrder.body.data.orderId)
    const details = [firstDetails.body.data, secondDetails.body.data]
    const paidOrders = details.filter((order) => order.status === OrderStatus.PAID)
    const pendingOrders = details.filter((order) => order.status === OrderStatus.PENDING)

    expect(paidOrders).toHaveLength(1)
    expect(paidOrders[0].tickets).toHaveLength(1)
    expect(pendingOrders).toHaveLength(1)
    expect(pendingOrders[0].tickets).toEqual([])

    const ticketType = await getTicketType(ctx.app, market.organizer.accessToken, market.paidTicketTypeId)
    expect(ticketType.status).toBe(200)
    expect(Number(ticketType.body.data.availableQuantity)).toBe(0)
  })
})
