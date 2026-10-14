import request from 'supertest'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T31 - Health check com banco disponível', () => {
  const ctx = setupE2EApp()

  it('returns 200 and OK when database is up', async () => {
    const res = await request(ctx.app.getHttpServer()).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.text).toBe('OK')
  })
})
