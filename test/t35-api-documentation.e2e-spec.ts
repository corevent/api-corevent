import request from 'supertest'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T35 - Documentação da API acessível', () => {
  const ctx = setupE2EApp()

  it('serves swagger UI and openapi json with main paths', async () => {
    const swagger = await request(ctx.app.getHttpServer()).get('/swagger')
    const spec = await request(ctx.app.getHttpServer()).get('/swagger-json')

    expect(swagger.status).toBe(200)
    expect(swagger.text.toLowerCase()).toMatch(/swagger|openapi|api corevent/)
    expect(spec.status).toBe(200)
    expect(JSON.stringify(spec.body).toLowerCase()).toMatch(/\/auth\/register/)
    expect(JSON.stringify(spec.body).toLowerCase()).toMatch(/\/events/)
  })
})
