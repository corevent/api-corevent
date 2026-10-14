import request from 'supertest'
import { bearer, createOrganizerEvent } from './helpers/api'
import { uniqueSuffix } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T12 - Editar evento próprio', () => {
  const ctx = setupE2EApp()

  it('updates and persists the event title', async () => {
    const { organizer, eventId } = await createOrganizerEvent(ctx.app)
    const newTitle = `Edited ${uniqueSuffix()}`

    const updated = await request(ctx.app.getHttpServer())
      .patch(`/api/events/${eventId}`)
      .set(bearer(organizer.accessToken))
      .send({ title: newTitle })

    expect(updated.status).toBe(200)
    expect(updated.body.data.title).toBe(newTitle)

    const persisted = await request(ctx.app.getHttpServer())
      .get(`/api/events/${eventId}`)
      .set(bearer(organizer.accessToken))
    expect(persisted.status).toBe(200)
    expect(persisted.body.data.title).toBe(newTitle)
  })
})
