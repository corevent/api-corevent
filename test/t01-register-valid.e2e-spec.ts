import request from 'supertest'
import { registerPayload } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T01 - Cadastro com dados válidos', () => {
  const ctx = setupE2EApp()

  it('creates a user with valid payload', async () => {
    const payload = registerPayload()
    const res = await request(ctx.app.getHttpServer()).post('/api/auth/register').send(payload)

    expect(res.status).toBe(201)
    expect(res.body.data.email).toBe(payload.email)
    expect(res.body.data.name).toBe(payload.name)
    expect(res.body.data.id).toEqual(expect.any(String))
  })
})
