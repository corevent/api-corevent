import request from 'supertest'
import { bearer, inviteStaff, registerAndLogin, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T16 - Aceitar convite de colaborador', () => {
  const ctx = setupE2EApp()

  it('links staff to the event after accept', async () => {
    const market = await setupMarketplace(ctx.app)
    const collaborator = await registerAndLogin(ctx.app)
    const invitation = await inviteStaff(ctx.app, market.organizer.accessToken, market.eventId, collaborator.email)
    expect(invitation.status).toBe(201)

    const accepted = await request(ctx.app.getHttpServer())
      .post(`/api/invitations/${invitation.body.data.id}/accept`)
      .set(bearer(collaborator.accessToken))

    expect(accepted.status).toBe(200)
    expect(accepted.body.data.userId).toBe(collaborator.id)
    expect(accepted.body.data.staffInvitationId).toBe(invitation.body.data.id)
  })
})
