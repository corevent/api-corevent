import { loginUser, registerAndLogin } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T05 - Login válido', () => {
  const ctx = setupE2EApp()

  it('returns access and refresh tokens', async () => {
    const user = await registerAndLogin(ctx.app)
    const res = await loginUser(ctx.app, user.email, user.password)

    expect(res.status).toBe(200)
    expect(res.body.accessToken).toEqual(expect.any(String))
    expect(res.body.refreshToken).toEqual(expect.any(String))
  })
})
