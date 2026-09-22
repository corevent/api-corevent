import request from 'supertest'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T48 - CORS habilitado', () => {
  const ctx = setupE2EApp()

  it('answers preflight with Access-Control-Allow-Origin', async () => {
    const res = await request(ctx.app.getHttpServer())
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST')

    expect(res.headers['access-control-allow-origin']).toBeDefined()
  })
})
