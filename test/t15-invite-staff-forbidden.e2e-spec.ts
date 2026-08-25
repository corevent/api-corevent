import { inviteStaff, registerAndLogin, setupMarketplace } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T15 - Convidar colaborador sem ser organizador', () => {
  const ctx = setupE2EApp()

  it('rejects invitation from non-organizer with 403', async () => {
    const market = await setupMarketplace(ctx.app)
    const stranger = await registerAndLogin(ctx.app)
    const guest = await registerAndLogin(ctx.app)
    const res = await inviteStaff(ctx.app, stranger.accessToken, market.eventId, guest.email)

    expect(res.status).toBe(403)
  })
})
