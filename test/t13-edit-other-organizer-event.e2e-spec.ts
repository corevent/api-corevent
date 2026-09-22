import request from 'supertest'
import { addOrganizerPayment, bearer, createOrganizerEvent, registerAndLogin } from './helpers/api'
import { errorText, uniqueSuffix } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T13 - Editar evento de outro organizador', () => {
  const ctx = setupE2EApp()

  it('rejects edit by another organizer with 400 and keeps original title', async () => {
    const owner = await createOrganizerEvent(ctx.app)
    const other = await registerAndLogin(ctx.app)
    await addOrganizerPayment(ctx.app, other)

    const originalTitle = owner.title
    const res = await request(ctx.app.getHttpServer())
      .patch(`/api/events/${owner.eventId}`)
      .set(bearer(other.accessToken))
      .send({ title: `Hijacked ${uniqueSuffix()}` })

    expect(res.status).toBe(400)
    expect(errorText(res.body).toLowerCase()).toMatch(/not the organizer/)

    const persisted = await request(ctx.app.getHttpServer())
      .get(`/api/events/${owner.eventId}`)
      .set(bearer(owner.organizer.accessToken))
    expect(persisted.status).toBe(200)
    expect(persisted.body.data.title).toBe(originalTitle)
  })
})
