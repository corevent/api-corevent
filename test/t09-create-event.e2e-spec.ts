import request from 'supertest'
import { bearer, createOrganizerEvent } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'
import { EventStatus } from '~/modules/events-module/events.entity'

describe('T09 - Criar evento válido', () => {
  const ctx = setupE2EApp()

  it('creates an event and lists it for the organizer', async () => {
    const { organizer, eventId, title } = await createOrganizerEvent(ctx.app)

    expect(eventId).toEqual(expect.any(String))

    const listed = await request(ctx.app.getHttpServer())
      .get('/api/events/my/organizer')
      .query({ page: 1, limit: 10, status: EventStatus.DRAFT })
      .set(bearer(organizer.accessToken))

    expect(listed.status).toBe(200)
    expect(listed.body.data.some((event: { id: string; title: string }) => event.id === eventId)).toBe(true)
    expect(listed.body.data.some((event: { title: string }) => event.title === title)).toBe(true)
  })
})
