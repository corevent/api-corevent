import { registerUser } from './helpers/api'
import { errorText, WEAK_PASSWORD } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T02 - Cadastro com senha fraca', () => {
  const ctx = setupE2EApp()

  it('rejects weak password with 400', async () => {
    const res = await registerUser(ctx.app, { password: WEAK_PASSWORD })

    expect(res.status).toBe(400)
    expect(errorText(res.body)).toMatch(/password/i)
  })
})
