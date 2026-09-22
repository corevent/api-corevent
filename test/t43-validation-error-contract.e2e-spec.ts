import request from 'supertest'
import { registerPayload } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T43 - Contrato de erro de validação', () => {
  const ctx = setupE2EApp()

  it('returns a consistent 400 body from ValidationPipe', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/api/auth/register')
      .send({ ...registerPayload(), role: 'admin' })

    expect(res.status).toBe(400)
    expect(res.headers['content-type']).toMatch(/json/)
    expect(res.body).toEqual(
      expect.objectContaining({
        statusCode: 400,
        error: 'Bad Request',
      }),
    )
    expect(Array.isArray(res.body.message) || typeof res.body.message === 'string').toBe(true)
  })
})
