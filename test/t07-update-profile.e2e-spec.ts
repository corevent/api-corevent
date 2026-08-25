import request from 'supertest'
import { bearer, registerAndLogin } from './helpers/api'
import { uniqueSuffix } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T07 - Atualizar dados pessoais', () => {
  const ctx = setupE2EApp()

  it('updates and persists the user name', async () => {
    const user = await registerAndLogin(ctx.app)
    const newName = `Updated ${uniqueSuffix()}`

    const updated = await request(ctx.app.getHttpServer())
      .patch('/api/users')
      .set(bearer(user.accessToken))
      .send({ name: newName })

    expect(updated.status).toBe(200)
    expect(updated.body.data.name).toBe(newName)

    const profile = await request(ctx.app.getHttpServer()).get('/api/users/me').set(bearer(user.accessToken))
    expect(profile.status).toBe(200)
    expect(profile.body.data.name).toBe(newName)
  })
})
