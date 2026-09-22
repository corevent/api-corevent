import request from 'supertest'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T44 - Health check com contrato JSON estruturado', () => {
  const ctx = setupE2EApp()

  it('returns JSON with status, version, uptime and database check', async () => {
    const res = await request(ctx.app.getHttpServer()).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body).toEqual(
      expect.objectContaining({
        status: expect.stringMatching(/^(ok|up|healthy)$/i),
        version: expect.any(String),
        uptime: expect.any(Number),
        database: expect.stringMatching(/^(ok|up|healthy)$/i),
      }),
    )
  })
})
