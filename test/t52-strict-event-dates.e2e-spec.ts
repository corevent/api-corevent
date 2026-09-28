import request from 'supertest'
import { addOrganizerPayment, bearer, eventPayload, registerAndLogin } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T52 - Data de evento sem timezone', () => {
  const ctx = setupE2EApp()

  it('returns 400 when the event start date has no timezone', async () => {
    const organizer = await registerAndLogin(ctx.app)
    const payment = await addOrganizerPayment(ctx.app, organizer)
    expect(payment.status).toBe(201)

    const response = await request(ctx.app.getHttpServer())
      .post('/api/events')
      .set(bearer(organizer.accessToken))
      .send(eventPayload({ startDate: '2026-01-01T00:00:00' }))

    expect(response.status).toBe(400)
    expect(response.body.message).toEqual(['startDate must be a valid ISO 8601 date string'])
  })
})
