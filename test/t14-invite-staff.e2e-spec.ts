import { inviteStaff, registerAndLogin, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'
import { EventStaffInvitationStatus } from '~/modules/event-staff-invitations/enums/event-staff-invitation.enums'

describe('T14 - Convidar colaborador para o evento', () => {
  const ctx = setupE2EApp()

  it('creates a pending staff invitation', async () => {
    const market = await setupMarketplace(ctx.app)
    const collaborator = await registerAndLogin(ctx.app)
    const res = await inviteStaff(ctx.app, market.organizer.accessToken, market.eventId, collaborator.email)

    expect(res.status).toBe(201)
    expect(res.body.data.invitationStatus).toBe(EventStaffInvitationStatus.PENDING)
    expect(res.body.data.userId).toBe(collaborator.id)
  })
})
