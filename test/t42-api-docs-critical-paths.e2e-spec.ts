import request from 'supertest'
import { setupE2EApp } from './helpers/setup-e2e-app'

interface OpenApiOperation {
  responses: Record<string, { description?: string }>
}

interface OpenApiSpec {
  paths: Record<string, Record<string, OpenApiOperation>>
}

describe('T42 - Documentação crítica acessível', () => {
  const ctx = setupE2EApp()

  it('documents auth, orders, check-in and webhook in OpenAPI', async () => {
    const spec = await request(ctx.app.getHttpServer()).get('/swagger-json')
    expect(spec.status).toBe(200)

    const serialized = JSON.stringify(spec.body).toLowerCase()
    expect(serialized).toMatch(/\/auth\/login/)
    expect(serialized).toMatch(/\/auth\/register/)
    expect(serialized).toMatch(/\/events\/\{eventid\}\/orders/)
    expect(serialized).toMatch(/\/events\/\{eventid\}\/checkin/)
    expect(serialized).toMatch(/\/pagbank\/webhooks/)
  })

  it('documents the status codes each critical route actually returns', async () => {
    const spec = await request(ctx.app.getHttpServer()).get('/swagger-json')
    expect(spec.status).toBe(200)

    const paths = (spec.body as OpenApiSpec).paths

    const createEvent = paths['/api/events'].post
    expect(createEvent.responses['201'].description).toBe('The event has been successfully created.')
    expect(createEvent.responses['400'].description).toContain('Start date must be after today')
    expect(createEvent.responses['401'].description).toBe('Unauthorized')
    expect(createEvent.responses['500']).toBeUndefined()

    const checkin = paths['/api/events/{eventId}/checkin'].post
    expect(checkin.responses['200']).toBeDefined()
    expect(checkin.responses['409'].description).toBe('Ticket already checked in')
    expect(checkin.responses['403'].description).toBe('You do not have permission to check in tickets for this event')

    const deletePayment = paths['/api/users/me/organizer-payment-info/{id}'].delete
    expect(deletePayment.responses['204'].description).toBe('Organizer payment info deleted successfully')
    expect(deletePayment.responses['200']).toBeUndefined()
    expect(deletePayment.responses['500']).toBeUndefined()

    const register = paths['/api/auth/register'].post
    expect(register.responses['201']).toBeDefined()
    expect(register.responses['400'].description).toContain('Email already used by another user')
    expect(register.responses['500']).toBeUndefined()

    const webhook = paths['/api/pagbank/webhooks'].post
    expect(webhook.responses['200'].description).toBe('Webhook processed successfully.')
    expect(webhook.responses['401'].description).toBe('Missing webhook payload')

    const checkoutRedirect = paths['/api/orders/success'].get
    expect(checkoutRedirect.responses['302'].description).toBe('Redirects to corevent://orders.')
  })
})
