import { loginUser, registerPayload } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'
import request from 'supertest'

describe('T41 - Rate limit no login', () => {
  const ctx = setupE2EApp({ enableThrottle: true })

  it('returns 429 after more than 10 login requests per minute', async () => {
    const payload = registerPayload()
    const created = await request(ctx.app.getHttpServer()).post('/api/auth/register').send(payload)
    expect(created.status).toBe(201)

    const statuses: number[] = []
    for (let index = 0; index < 11; index++) {
      const res = await loginUser(ctx.app, payload.email, payload.password)
      statuses.push(res.status)
    }

    expect(statuses[0]).toBe(200)
    expect(statuses[10]).toBe(429)
  })
})
