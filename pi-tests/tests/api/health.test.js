const request = require('supertest')
const normalizeApiBaseUrl = require('../../src/normalize-api-base-url')

const baseUrl = normalizeApiBaseUrl(process.env.API_BASE_URL || 'https://api.corevent.site')

describe('GET /api/health', () => {
  it('deve retornar status 200', async () => {
    const res = await request(baseUrl).get('/api/health')
    expect(res.statusCode).toBe(200)
  })

  it('deve retornar JSON de health', async () => {
    const res = await request(baseUrl).get('/api/health')
    expect(res.body).toBeDefined()
    expect(res.body.status).toBeDefined()
    expect(typeof res.body.uptime).toBe('number')
  })
})
