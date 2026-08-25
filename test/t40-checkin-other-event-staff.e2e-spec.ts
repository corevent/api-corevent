import { acceptInvitation, checkin, createOrder, inviteStaff, registerAndLogin, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T40 - Check-in por staff de outro evento', () => {
  const ctx = setupE2EApp()

  it('rejects check-in from staff of a different event with 403', async () => {
    const eventA = await setupMarketplace(ctx.app)
    const eventB = await setupMarketplace(ctx.app)
    const staff = await registerAndLogin(ctx.app)

    const invitation = await inviteStaff(ctx.app, eventB.organizer.accessToken, eventB.eventId, staff.email)
    expect(invitation.status).toBe(201)

    const accepted = await acceptInvitation(ctx.app, staff.accessToken, invitation.body.data.id as string)
    expect(accepted.status).toBeGreaterThanOrEqual(200)
    expect(accepted.status).toBeLessThan(300)

    const order = await createOrder(ctx.app, eventA.buyer.accessToken, eventA.eventId, eventA.freeTicketTypeId)
    expect(order.status).toBe(201)

    const qrToken = order.body.data.qrCodes[0] as string
    const res = await checkin(ctx.app, eventA.eventId, qrToken, staff.accessToken)

    expect(res.status).toBe(403)
  })
})
