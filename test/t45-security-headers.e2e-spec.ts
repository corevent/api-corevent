import request from 'supertest'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T45 - Headers de segurança (Helmet)', () => {
  const ctx = setupE2EApp()

  it('sends standard browser security headers', async () => {
    const res = await request(ctx.app.getHttpServer()).get('/api/ping')

    expect(res.status).toBe(200)
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['x-frame-options']).toMatch(/deny|sameorigin/i)
  })
})
