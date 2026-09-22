import request from 'supertest'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T42 - Documentação crítica acessível', () => {
  const ctx = setupE2EApp()

  it('documents auth, orders, check-in and webhook in OpenAPI', async () => {
    const spec = await request(ctx.app.getHttpServer()).get('/swagger-json')
    expect(spec.status).toBe(200)

    const serialized = JSON.stringify(spec.body).toLowerCase()
    expect(serialized).toMatch(/\/auth\/login/)
    expect(serialized).toMatch(/\/auth\/register/)
    expect(serialized).toMatch(/\/events\/\{eventid\}\/orders/)
    expect(serialized).toMatch(/\/events\/\{eventid\}\/checkin/)
    expect(serialized).toMatch(/\/pagbank\/webhooks/)
  })
})
