import request from 'supertest'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T44 - Health check com contrato JSON estruturado', () => {
  const ctx = setupE2EApp()

  it('returns JSON with status, version, uptime and nested dependency checks', async () => {
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
          s3: healthy,
        },
      }),
    )
  })
})
