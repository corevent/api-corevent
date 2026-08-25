import request from 'supertest'
import { DataSource } from 'typeorm'
import { NestExpressApplication } from '@nestjs/platform-express'
import { createTestApp } from './helpers/create-test-app'

describe('T36 - Health check com banco indisponível', () => {
  let app: NestExpressApplication

  beforeAll(async () => {
    const testApp = await createTestApp()
    app = testApp.app
  })

  afterAll(async () => {
    try {
      await app.close()
    } catch {
      // DataSource may already be closed by the test
    }
  })

  it('returns 5xx and does not report OK when the database is down', async () => {
    const dataSource = app.get(DataSource)
    await dataSource.destroy()

    const res = await request(app.getHttpServer()).get('/api/health')

    expect(res.status).toBeGreaterThanOrEqual(500)
    expect(res.text).not.toBe('OK')
  })
})
