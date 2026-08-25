import { paidWebhookPayload, postPagBankWebhook, signWebhook } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T46 - Rate limit no webhook público', () => {
  const ctx = setupE2EApp({ enableThrottle: true })

  it('returns 429 after more than 10 webhook requests per minute', async () => {
    const rawBody = paidWebhookPayload('00000000-0000-0000-0000-000000000002')
    const signature = signWebhook(rawBody)
    const statuses: number[] = []

    for (let index = 0; index < 11; index++) {
      const res = await postPagBankWebhook(ctx.app, rawBody, signature)
      statuses.push(res.status)
    }

    expect(statuses[10]).toBe(429)
  })
})
