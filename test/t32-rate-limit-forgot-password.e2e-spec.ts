import request from 'supertest'
import { uniqueSuffix } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T32 - Rate limit em recuperação/verificação de e-mail', () => {
  const ctx = setupE2EApp({ enableThrottle: true })

  it('returns 429 after more than 3 requests per minute', async () => {
    const email = `throttle.${uniqueSuffix()}@corevent.test`
    const responses: number[] = []

    for (let index = 0; index < 4; index++) {
      const res = await request(ctx.app.getHttpServer()).post('/api/auth/forgot-password').send({ email })
      responses.push(res.status)
    }

    expect(responses[0]).toBe(200)
    expect(responses[1]).toBe(200)
    expect(responses[2]).toBe(200)
    expect(responses[3]).toBe(429)
  })
})
