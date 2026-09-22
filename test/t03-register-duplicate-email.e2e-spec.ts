import { registerAndLogin, registerUser } from './helpers/api'
import { errorText } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T03 - Cadastro com e-mail já usado', () => {
  const ctx = setupE2EApp()

  it('rejects duplicate email with 400', async () => {
    const user = await registerAndLogin(ctx.app)
    const res = await registerUser(ctx.app, { email: user.email })

    expect(res.status).toBe(400)
    expect(errorText(res.body).toLowerCase()).toMatch(/email already used/)
  })
})
