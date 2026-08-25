import request from 'supertest'
import { registerPayload } from './helpers/api'
import { errorText } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T34 - Payload com campos não permitidos', () => {
  const ctx = setupE2EApp()

  it('rejects non-whitelisted properties with 400', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/api/auth/register')
      .send({ ...registerPayload(), role: 'admin' })

    expect(res.status).toBe(400)
    expect(errorText(res.body).toLowerCase()).toMatch(/should not exist|property role/)
  })
})
