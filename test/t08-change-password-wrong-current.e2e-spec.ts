import request from 'supertest'
import { bearer, registerAndLogin } from './helpers/api'
import { errorText, STRONG_PASSWORD, WRONG_PASSWORD } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T08 - Troca de senha com senha atual errada', () => {
  const ctx = setupE2EApp()

  it('rejects wrong current password with 400', async () => {
    const user = await registerAndLogin(ctx.app)
    const res = await request(ctx.app.getHttpServer())
      .patch('/api/users/pass')
      .set(bearer(user.accessToken))
      .send({ currentPassword: WRONG_PASSWORD, newPassword: STRONG_PASSWORD })

    expect(res.status).toBe(400)
    expect(errorText(res.body).toLowerCase()).toMatch(/invalid current password/)
  })
})
