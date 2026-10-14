import { INestApplication } from '@nestjs/common'
import { createHash } from 'node:crypto'
import request, { type Response } from 'supertest'
import { EventCategory, EventLocationType, EventStatus } from '~/modules/events-module/events.entity'
import { EventStaffAccessLevel } from '~/modules/event-staff-invitations/enums/event-staff-invitation.enums'
import { DocumentType } from '~/modules/users/enums/document-type.enum'
import { type CreateUserDto } from '~/modules/users/dto/users.dto'
import { daysFromNow, generateValidCpf, STRONG_PASSWORD, uniqueSuffix, verifyEmailCode } from './fixtures'

export interface AuthUser {
  id: string
  name: string
  email: string
  document: string
  password: string
  accessToken: string
  refreshToken: string
}

export interface EventContext {
  organizer: AuthUser
  eventId: string
  startDate: string
  title: string
}

type App = INestApplication

export function bearer(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` }
}

export function registerPayload(overrides: Partial<CreateUserDto> = {}): CreateUserDto {
  const suffix = uniqueSuffix()
  return {
    name: `User ${suffix}`,
    email: `user.${suffix}@corevent.test`,
    password: STRONG_PASSWORD,
    birthDate: '1990-01-15',
    documentType: DocumentType.CPF,
    document: generateValidCpf(),
    verifyEmailCode: verifyEmailCode(),
    ...overrides,
  }
}

export async function registerUser(app: App, overrides: Partial<CreateUserDto> = {}): Promise<Response> {
  return request(app.getHttpServer()).post('/api/auth/register').send(registerPayload(overrides))
}

export async function loginUser(app: App, email: string, password: string): Promise<Response> {
  return request(app.getHttpServer()).post('/api/auth/login').send({ email, password })
}

export async function registerAndLogin(app: App, overrides: Partial<CreateUserDto> = {}): Promise<AuthUser> {
  const payload = registerPayload(overrides)
  const created = await request(app.getHttpServer()).post('/api/auth/register').send(payload)
  if (created.status !== 201) {
    throw new Error(`Register failed (${created.status}): ${JSON.stringify(created.body)}`)
  }

  const session = await loginUser(app, payload.email, payload.password)
  if (session.status !== 200) {
    throw new Error(`Login failed (${session.status}): ${JSON.stringify(session.body)}`)
  }

  return {
    id: created.body.data.id as string,
    name: created.body.data.name as string,
    email: payload.email,
    document: payload.document,
    password: payload.password,
    accessToken: session.body.accessToken as string,
    refreshToken: session.body.refreshToken as string,
  }
}

export async function addOrganizerPayment(app: App, user: AuthUser): Promise<Response> {
  return request(app.getHttpServer()).post('/api/users/me/organizer-payment-info').set(bearer(user.accessToken)).send({
    description: 'PIX e2e',
    pixType: 'cpf',
    pixKey: user.document,
  })
}

export function eventPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    title: `Event ${uniqueSuffix()}`,
    description: 'E2E event',
    maxParticipants: 100,
    locationType: EventLocationType.ONLINE,
    startDate: daysFromNow(30),
    endDate: daysFromNow(31),
    category: EventCategory.MUSIC,
    isAdultOnly: false,
    status: EventStatus.DRAFT,
    ...overrides,
  }
}

export async function createEvent(app: App, token: string, overrides: Record<string, unknown> = {}): Promise<Response> {
  return request(app.getHttpServer()).post('/api/events').set(bearer(token)).send(eventPayload(overrides))
}

export async function createOrganizerEvent(app: App): Promise<EventContext> {
  const organizer = await registerAndLogin(app)
  const payment = await addOrganizerPayment(app, organizer)
  if (payment.status !== 201) {
    throw new Error(`Payment info failed (${payment.status}): ${JSON.stringify(payment.body)}`)
  }

  const payload = eventPayload()
  const created = await createEvent(app, organizer.accessToken, payload)
  if (created.status !== 201) {
    throw new Error(`Create event failed (${created.status}): ${JSON.stringify(created.body)}`)
  }

  return {
    organizer,
    eventId: created.body.data.id as string,
    startDate: payload.startDate as string,
    title: payload.title as string,
  }
}

export async function openEvent(app: App, token: string, eventId: string): Promise<Response> {
  return request(app.getHttpServer())
    .patch(`/api/events/${eventId}`)
    .set(bearer(token))
    .send({ status: EventStatus.OPENED })
}

export async function createTicketType(
  app: App,
  token: string,
  eventId: string,
  options: { name?: string; price?: number; totalQuantity?: number; endDate: string },
): Promise<Response> {
  return request(app.getHttpServer())
    .post(`/api/events/${eventId}/ticket-types`)
    .set(bearer(token))
    .send({
      name: options.name ?? `Ticket ${uniqueSuffix()}`,
      price: options.price ?? 0,
      totalQuantity: options.totalQuantity ?? 10,
      startDate: new Date().toISOString(),
      endDate: options.endDate,
    })
}

export async function createOrder(
  app: App,
  token: string,
  eventId: string,
  ticketTypeId: string,
  quantity = 1,
): Promise<Response> {
  return request(app.getHttpServer())
    .post(`/api/events/${eventId}/orders`)
    .set(bearer(token))
    .send({ items: [{ ticketTypeId, quantity }] })
}

export async function getTicketType(app: App, token: string, ticketTypeId: string): Promise<Response> {
  return request(app.getHttpServer()).get(`/api/events/ticket-types/${ticketTypeId}`).set(bearer(token))
}

export async function getOrder(app: App, token: string, orderId: string): Promise<Response> {
  return request(app.getHttpServer()).get(`/api/events/orders/${orderId}`).set(bearer(token))
}

export async function inviteStaff(
  app: App,
  token: string,
  eventId: string,
  email: string,
  accessLevel = EventStaffAccessLevel.CHECKIN,
): Promise<Response> {
  return request(app.getHttpServer())
    .post(`/api/invitations/events/${eventId}`)
    .set(bearer(token))
    .send({ email, originalAccessLevel: accessLevel })
}

export interface MarketplaceContext extends EventContext {
  buyer: AuthUser
  freeTicketTypeId: string
  paidTicketTypeId: string
  freeQuantity: number
  paidQuantity: number
}

interface MarketplaceOptions {
  freeQuantity?: number
  paidQuantity?: number
  paidPrice?: number
}

export async function setupMarketplace(app: App, options: MarketplaceOptions = {}): Promise<MarketplaceContext> {
  const freeQuantity = options.freeQuantity ?? 10
  const paidQuantity = options.paidQuantity ?? 10
  const ctx = await createOrganizerEvent(app)

  const freeType = await createTicketType(app, ctx.organizer.accessToken, ctx.eventId, {
    name: 'Free',
    price: 0,
    totalQuantity: freeQuantity,
    endDate: ctx.startDate,
  })
  if (freeType.status !== 201) {
    throw new Error(`Free ticket type failed (${freeType.status}): ${JSON.stringify(freeType.body)}`)
  }

  const paidType = await createTicketType(app, ctx.organizer.accessToken, ctx.eventId, {
    name: 'Paid',
    price: options.paidPrice ?? 50,
    totalQuantity: paidQuantity,
    endDate: ctx.startDate,
  })
  if (paidType.status !== 201) {
    throw new Error(`Paid ticket type failed (${paidType.status}): ${JSON.stringify(paidType.body)}`)
  }

  const opened = await openEvent(app, ctx.organizer.accessToken, ctx.eventId)
  if (opened.status !== 200) {
    throw new Error(`Open event failed (${opened.status}): ${JSON.stringify(opened.body)}`)
  }

  const buyer = await registerAndLogin(app)
  return {
    ...ctx,
    buyer,
    freeTicketTypeId: freeType.body.data.id as string,
    paidTicketTypeId: paidType.body.data.id as string,
    freeQuantity,
    paidQuantity,
  }
}

export function signWebhook(rawBody: string): string {
  const token = process.env.PAGBANK_TOKEN || 'e2e-pagbank-token'
  return createHash('sha256').update(`${token}-${rawBody}`).digest('hex')
}

export function paidWebhookPayload(orderId: string): string {
  return JSON.stringify({
    id: `ORDE_${orderId}`,
    reference_id: orderId,
    charges: [{ id: `CHAR_${orderId}`, status: 'PAID' }],
  })
}

export async function postPagBankWebhook(app: App, rawBody: string, authenticityToken?: string): Promise<Response> {
  const req = request(app.getHttpServer())
    .post('/api/pagbank/webhooks')
    .set('Content-Type', 'application/json')
    .send(rawBody)

  if (authenticityToken) {
    req.set('x-authenticity-token', authenticityToken)
  }

  return req
}

export async function checkin(app: App, eventId: string, qrToken: string, token?: string): Promise<Response> {
  const req = request(app.getHttpServer()).post(`/api/events/${eventId}/checkin`).send({ qrToken })
  if (token) {
    req.set(bearer(token))
  }
  return req
}

export async function acceptInvitation(app: App, token: string, invitationId: string): Promise<Response> {
  return request(app.getHttpServer()).post(`/api/invitations/${invitationId}/accept`).set(bearer(token))
}
