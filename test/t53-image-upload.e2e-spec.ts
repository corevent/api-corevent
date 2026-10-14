import { INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { Repository } from 'typeorm'
import { Events } from '~/modules/events-module/events.entity'
import { Users } from '~/modules/users/users.entity'
import { bearer, createOrganizerEvent, registerAndLogin, type AuthUser } from './helpers/api'
import { createTestApp } from './helpers/create-test-app'
import { InMemoryObjectStorage } from './helpers/in-memory-object-storage'

describe('T53 - Upload de avatar e banner', () => {
  let app: INestApplication
  let storage: InMemoryObjectStorage
  let users: Repository<Users>
  let events: Repository<Events>

  beforeAll(async () => {
    const testApp = await createTestApp()
    app = testApp.app
    storage = testApp.objectStorage
    users = app.get<Repository<Users>>(getRepositoryToken(Users))
    events = app.get<Repository<Events>>(getRepositoryToken(Events))
  })

  afterAll(async () => {
    await app?.close()
  })

  it('rejects presign without authentication', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/storage/presign')
      .send({ purpose: 'avatar', contentType: 'image/png' })

    expect(res.status).toBe(401)
  })

  it('rejects an unsupported image content type', async () => {
    const user = await registerAndLogin(app)

    const res = await request(app.getHttpServer())
      .post('/api/storage/presign')
      .set(bearer(user.accessToken))
      .send({ purpose: 'avatar', contentType: 'image/gif' })

    expect(res.status).toBe(400)
  })

  it('stores the avatar key and returns a signed read URL only after the upload exists', async () => {
    const user = await registerAndLogin(app)
    const first = await presignAvatar(app, user)
    expect(first.status).toBe(201)
    expect(first.body.data.key).toMatch(new RegExp(`^avatars/${user.id}/.+\\.png$`))
    expect(first.body.data.expiresIn).toBe(600)
    expect(first.body.data.uploadUrl).toBe(storage.writeUrl(first.body.data.key as string, 'image/png'))
    expect(first.body.data.publicUrl).toBe(storage.readUrl(first.body.data.key as string))

    const missing = await confirmAvatar(app, user, first.body.data.key as string)
    expect(missing.status).toBe(400)
    expect(missing.body.message).toBe('Uploaded image not found in storage')

    storage.markUploaded(first.body.data.key as string)
    const saved = await confirmAvatar(app, user, first.body.data.key as string)
    expect(saved.status).toBe(200)
    expect(saved.body.data.avatarUrl).toBe(storage.readUrl(first.body.data.key as string))
    expect(await storedAvatarKey(users, user.id)).toBe(first.body.data.key)

    const profile = await request(app.getHttpServer()).get('/api/users/me').set(bearer(user.accessToken))
    expect(profile.status).toBe(200)
    expect(profile.body.data.avatarUrl).toBe(storage.readUrl(first.body.data.key as string))

    const second = await presignAvatar(app, user)
    storage.markUploaded(second.body.data.key as string)
    const replaced = await confirmAvatar(app, user, second.body.data.key as string)
    expect(replaced.status).toBe(200)
    expect(replaced.body.data.avatarUrl).toBe(storage.readUrl(second.body.data.key as string))
    expect(await storedAvatarKey(users, user.id)).toBe(second.body.data.key)
    expect(storage.wasDeleted(first.body.data.key as string)).toBe(true)
    expect(storage.wasDeleted(second.body.data.key as string)).toBe(false)
  })

  it('rejects an avatar key that belongs to another user', async () => {
    const owner = await registerAndLogin(app)
    const intruder = await registerAndLogin(app)
    const presigned = await presignAvatar(app, owner)
    storage.markUploaded(presigned.body.data.key as string)

    const res = await confirmAvatar(app, intruder, presigned.body.data.key as string)

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Invalid avatar upload key')
    expect(await storedAvatarKey(users, owner.id)).toBeNull()
  })

  it('stores the banner key for the organizer and signs it on the event response', async () => {
    const { organizer, eventId } = await createOrganizerEvent(app)
    const stranger = await registerAndLogin(app)

    const missingEvent = await presignBanner(app, organizer, randomUUID())
    expect(missingEvent.status).toBe(404)
    expect(missingEvent.body.message).toBe('Event not found')

    const forbidden = await presignBanner(app, stranger, eventId)
    expect(forbidden.status).toBe(400)
    expect(forbidden.body.message).toBe('You are not the organizer of this event')

    const withoutEvent = await request(app.getHttpServer())
      .post('/api/storage/presign')
      .set(bearer(organizer.accessToken))
      .send({ purpose: 'event_banner', contentType: 'image/jpeg' })
    expect(withoutEvent.status).toBe(400)

    const presigned = await presignBanner(app, organizer, eventId)
    expect(presigned.status).toBe(201)
    const key = presigned.body.data.key as string
    expect(key).toMatch(new RegExp(`^events/${eventId}/banner/.+\\.jpg$`))
    expect(presigned.body.data.uploadUrl).toBe(storage.writeUrl(key, 'image/jpeg'))

    const missingFile = await confirmBanner(app, organizer, eventId, key)
    expect(missingFile.status).toBe(400)
    expect(missingFile.body.message).toBe('Uploaded image not found in storage')

    storage.markUploaded(key)
    const strangerConfirm = await confirmBanner(app, stranger, eventId, key)
    expect(strangerConfirm.status).toBe(400)
    expect(strangerConfirm.body.message).toBe('You are not the organizer of this event')

    const saved = await confirmBanner(app, organizer, eventId, key)
    expect(saved.status).toBe(200)
    expect(saved.body.data.bannerUrl).toBe(storage.readUrl(key))
    expect(await storedBannerKey(events, eventId)).toBe(key)

    const listed = await request(app.getHttpServer()).get(`/api/events/${eventId}`).set(bearer(organizer.accessToken))
    expect(listed.status).toBe(200)
    expect(listed.body.data.bannerUrl).toBe(storage.readUrl(key))
  })

  it('replaces the event banner and deletes the previous object', async () => {
    const { organizer, eventId } = await createOrganizerEvent(app)
    const firstKey = await uploadBanner(app, storage, organizer, eventId)
    const secondKey = await uploadBanner(app, storage, organizer, eventId)

    expect(await storedBannerKey(events, eventId)).toBe(secondKey)
    expect(storage.wasDeleted(firstKey)).toBe(true)
    expect(storage.wasDeleted(secondKey)).toBe(false)

    const event = await request(app.getHttpServer()).get(`/api/events/${eventId}`).set(bearer(organizer.accessToken))
    expect(event.body.data.bannerUrl).toBe(storage.readUrl(secondKey))
  })
})

function presignAvatar(app: INestApplication, user: AuthUser) {
  return request(app.getHttpServer())
    .post('/api/storage/presign')
    .set(bearer(user.accessToken))
    .send({ purpose: 'avatar', contentType: 'image/png' })
}

function presignBanner(app: INestApplication, user: AuthUser, eventId: string) {
  return request(app.getHttpServer())
    .post('/api/storage/presign')
    .set(bearer(user.accessToken))
    .send({ purpose: 'event_banner', contentType: 'image/jpeg', eventId })
}

function confirmAvatar(app: INestApplication, user: AuthUser, key: string) {
  return request(app.getHttpServer()).patch('/api/users/me/avatar').set(bearer(user.accessToken)).send({ key })
}

function confirmBanner(app: INestApplication, user: AuthUser, eventId: string, key: string) {
  return request(app.getHttpServer())
    .patch(`/api/events/${eventId}/banner`)
    .set(bearer(user.accessToken))
    .send({ key })
}

async function uploadBanner(
  app: INestApplication,
  storage: InMemoryObjectStorage,
  user: AuthUser,
  eventId: string,
): Promise<string> {
  const presigned = await presignBanner(app, user, eventId)
  if (presigned.status !== 201) {
    throw new Error(`Presign banner failed (${presigned.status}): ${JSON.stringify(presigned.body)}`)
  }
  const key = presigned.body.data.key as string
  storage.markUploaded(key)
  const saved = await confirmBanner(app, user, eventId, key)
  if (saved.status !== 200) {
    throw new Error(`Confirm banner failed (${saved.status}): ${JSON.stringify(saved.body)}`)
  }
  return key
}

async function storedAvatarKey(users: Repository<Users>, userId: string): Promise<string | null> {
  const user = await users.findOneByOrFail({ id: userId })
  return user.avatarKey ?? null
}

async function storedBannerKey(events: Repository<Events>, eventId: string): Promise<string | null> {
  const event = await events.findOneByOrFail({ id: eventId })
  return event.bannerKey ?? null
}
