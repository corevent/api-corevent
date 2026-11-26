import request from 'supertest'
import { bearer, createOrder, getOrder, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'
import { OrderStatus } from '~/modules/orders/orders.entity'
import { EventStatus } from '~/modules/events-module/events.entity'

describe('T59 - Cancelamento de evento com pedidos', () => {
  const ctx = setupE2EApp()

  it('cancels opened event, marks pending orders cancelled and paid as pending_refund', async () => {
    const market = await setupMarketplace(ctx.app)

    const freeOrder = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.freeTicketTypeId)
    expect(freeOrder.status).toBe(201)

    const paidOrder = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.paidTicketTypeId)
    expect(paidOrder.status).toBe(201)
    expect(paidOrder.body.data.orderId).toBeDefined()

    const cancel = await request(ctx.app.getHttpServer())
      .post(`/api/events/${market.eventId}/cancel`)
      .set(bearer(market.organizer.accessToken))

    expect([200, 201]).toContain(cancel.status)

    const event = await request(ctx.app.getHttpServer())
      .get(`/api/events/${market.eventId}`)
      .set(bearer(market.organizer.accessToken))

    expect(event.status).toBe(200)
    expect(event.body.data.status).toBe(EventStatus.CANCELED)

    // Unpaid checkout stays pending until cancel → cancelled
    const unpaid = await getOrder(ctx.app, market.buyer.accessToken, paidOrder.body.data.orderId as string)
    expect(unpaid.status).toBe(200)
    expect(unpaid.body.data.status).toBe(OrderStatus.CANCELLED)

    // Already-paid free order → pending_refund
    const fulfilled = await getOrder(ctx.app, market.buyer.accessToken, freeOrder.body.data.orderId as string)
    expect(fulfilled.status).toBe(200)
    expect(fulfilled.body.data.status).toBe(OrderStatus.PENDING_REFUND)
  })
})
