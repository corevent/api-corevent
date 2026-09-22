import request from 'supertest'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T10 - Criar evento sem autenticação', () => {
  const ctx = setupE2EApp()

  it('rejects unauthenticated create with 401', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/api/events')
      .send({
        title: 'Unauthorized event',
        maxParticipants: 10,
        locationType: 'online',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(),
        category: 'music',
        isAdultOnly: false,
        status: 'draft',
      })

    expect(res.status).toBe(401)
  })
})
