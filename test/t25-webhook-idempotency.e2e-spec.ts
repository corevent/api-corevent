import request from 'supertest'
import { createOrder, getOrder, getTicketType, paidWebhookPayload, setupMarketplace, signWebhook } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'
import { OrderStatus } from '~/modules/orders/orders.entity'

describe('T25 - Webhook repetido (idempotência)', () => {
  const ctx = setupE2EApp()

  it('does not double-decrement stock on repeated webhook', async () => {
    const market = await setupMarketplace(ctx.app, { paidQuantity: 3 })
    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.paidTicketTypeId)
    expect(order.status).toBe(201)

    const orderId = order.body.data.orderId as string
    const rawBody = paidWebhookPayload(orderId)
    const signature = signWebhook(rawBody)

    const first = await request(ctx.app.getHttpServer())
      .post('/api/pagbank/webhooks')
      .set('x-authenticity-token', signature)
      .set('Content-Type', 'application/json')
      .send(rawBody)
    const second = await request(ctx.app.getHttpServer())
      .post('/api/pagbank/webhooks')
      .set('x-authenticity-token', signature)
      .set('Content-Type', 'application/json')
      .send(rawBody)

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)

    const details = await getOrder(ctx.app, market.buyer.accessToken, orderId)
    expect(details.status).toBe(200)
    expect(details.body.data.status).toBe(OrderStatus.PAID)

    const ticketType = await getTicketType(ctx.app, market.organizer.accessToken, market.paidTicketTypeId)
    expect(ticketType.status).toBe(200)
    expect(Number(ticketType.body.data.availableQuantity)).toBe(2)
  })
})
