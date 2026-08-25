import request from 'supertest'
import { paidWebhookPayload, signWebhook } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T26 - Webhook sem assinatura / assinatura inválida', () => {
  const ctx = setupE2EApp()

  it('rejects webhook without authenticity token with 401', async () => {
    const rawBody = paidWebhookPayload('00000000-0000-0000-0000-000000000000')
    const res = await request(ctx.app.getHttpServer())
      .post('/api/pagbank/webhooks')
      .set('Content-Type', 'application/json')
      .send(rawBody)

    expect(res.status).toBe(401)
  })

  it('rejects webhook with invalid authenticity token with 401', async () => {
    const rawBody = paidWebhookPayload('00000000-0000-0000-0000-000000000001')
    const validSignature = signWebhook(rawBody)
    const invalidSignature = `${validSignature.slice(0, -1)}${validSignature.endsWith('a') ? 'b' : 'a'}`

    const res = await request(ctx.app.getHttpServer())
      .post('/api/pagbank/webhooks')
      .set('x-authenticity-token', invalidSignature)
      .set('Content-Type', 'application/json')
      .send(rawBody)

    expect(res.status).toBe(401)
  })
})
