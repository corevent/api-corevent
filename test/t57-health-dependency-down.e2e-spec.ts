import request from 'supertest'
import { NestExpressApplication } from '@nestjs/platform-express'
import { StorageHealthService } from '~/modules/storage/storage-health.service'
import { createTestApp, type TestApp } from './helpers/create-test-app'

describe('T57 - Health check com dependência externa indisponível', () => {
  let app: NestExpressApplication
  let testApp: TestApp

  beforeAll(async () => {
    testApp = await createTestApp()
    app = testApp.app
  })

  afterAll(async () => {
    await app.close()
  })

  afterEach(() => {
    testApp.mailService.checkConnection.mockResolvedValue('OK')
    const storageHealth = app.get(StorageHealthService) as { checkBucket: jest.Mock }
    storageHealth.checkBucket.mockResolvedValue('OK')
  })

  it('returns 503 when mail dependency is down', async () => {
    testApp.mailService.checkConnection.mockResolvedValue('error')

    const res = await request(app.getHttpServer()).get('/api/health')

    expect(res.status).toBe(503)
    expect(res.body.status).toBe('error')
    expect(res.body.dependencies.mail).toBe('error')
    expect(res.body.dependencies.database).toBe('OK')
  })

  it('returns 503 when storage dependency is down', async () => {
    const storageHealth = app.get(StorageHealthService) as { checkBucket: jest.Mock }
    storageHealth.checkBucket.mockResolvedValue('error')

    const res = await request(app.getHttpServer()).get('/api/health')

    expect(res.status).toBe(503)
    expect(res.body.status).toBe('error')
    expect(res.body.dependencies.storage).toBe('error')
    expect(res.body.dependencies.database).toBe('OK')
  })
})
