import { loginUser, registerAndLogin } from './helpers/api'
import { WRONG_PASSWORD } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T06 - Login inválido', () => {
  const ctx = setupE2EApp()

  it('rejects wrong password with 401 and no tokens', async () => {
    const user = await registerAndLogin(ctx.app)
    const res = await loginUser(ctx.app, user.email, WRONG_PASSWORD)

    expect(res.status).toBe(401)
    expect(res.body.accessToken).toBeUndefined()
    expect(res.body.refreshToken).toBeUndefined()
  })
})
