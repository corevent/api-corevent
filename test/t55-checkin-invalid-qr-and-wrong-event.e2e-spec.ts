import { checkin, createOrder, setupMarketplace } from './helpers/api'
import { errorText } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T55 - Check-in com QR inválido ou evento errado', () => {
  const ctx = setupE2EApp()

  it('rejects unknown QR code with 404', async () => {
    const market = await setupMarketplace(ctx.app)
    const unknownQr = 'a'.repeat(64)

    const res = await checkin(ctx.app, market.eventId, unknownQr, market.organizer.accessToken)

    expect(res.status).toBe(404)
    expect(errorText(res.body).toLowerCase()).toMatch(/invalid qr/)
  })

  it('rejects check-in when ticket belongs to another event', async () => {
    const eventA = await setupMarketplace(ctx.app)
    const eventB = await setupMarketplace(ctx.app)

    const order = await createOrder(ctx.app, eventA.buyer.accessToken, eventA.eventId, eventA.freeTicketTypeId)
    expect(order.status).toBe(201)

    const qrToken = order.body.data.qrCodes[0] as string
    const res = await checkin(ctx.app, eventB.eventId, qrToken, eventB.organizer.accessToken)

    expect(res.status).toBe(400)
    expect(errorText(res.body).toLowerCase()).toMatch(/does not belong to this event/)
  })
})
