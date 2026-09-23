import { createHash, randomBytes } from 'node:crypto'
import request from 'supertest'
import { DataSource } from 'typeorm'
import { bearer, createOrder, setupMarketplace } from './helpers/api'
import { errorText } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'
import { Tickets, TicketStatus } from '~/modules/tickets/tickets.entity'

describe('T29 - Check-in com order não paga', () => {
  const ctx = setupE2EApp()

  it('rejects check-in when the order is still pending', async () => {
    const market = await setupMarketplace(ctx.app)
    const order = await createOrder(ctx.app, market.buyer.accessToken, market.eventId, market.paidTicketTypeId)
    expect(order.status).toBe(201)
    expect(order.body.data.qrCodes).toEqual([])

    const qrToken = randomBytes(32).toString('hex')
    const dataSource = ctx.app.get(DataSource)
    await dataSource.getRepository(Tickets).save({
      orderId: order.body.data.orderId as string,
      userId: market.buyer.id,
      ticketTypeId: market.paidTicketTypeId,
      eventId: market.eventId,
      qrCodeHash: createHash('sha256').update(qrToken).digest('hex'),
      qrCodeEncryptedToken: qrToken,
      status: TicketStatus.PENDING,
    })

    const res = await request(ctx.app.getHttpServer())
      .post(`/api/events/${market.eventId}/checkin`)
      .set(bearer(market.organizer.accessToken))
      .send({ qrToken })

    expect(res.status).toBe(400)
    expect(errorText(res.body).toLowerCase()).toMatch(/order is not paid/)
  })
})
