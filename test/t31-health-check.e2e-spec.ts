import request from 'supertest'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T31 - Health check com banco disponível', () => {
  const ctx = setupE2EApp()

  it('returns 200 and structured OK when database is up', async () => {
    const res = await request(ctx.app.getHttpServer()).get('/api/health')
    const healthy = expect.stringMatching(/^(ok|up|healthy)$/i)

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body).toEqual(
      expect.objectContaining({
        status: healthy,
        version: expect.any(String),
        uptime: expect.any(Number),
        dependencies: {
          database: healthy,
          mail: healthy,
          storage: healthy,
        },
      }),
    )
  })
})
