import { createOrganizerEvent, createTicketType } from './helpers/api'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T17 - Criar tipo de ingresso com estoque', () => {
  const ctx = setupE2EApp()

  it('creates ticket type with availableQuantity equal to totalQuantity', async () => {
    const { organizer, eventId, startDate } = await createOrganizerEvent(ctx.app)
    const totalQuantity = 25
    const res = await createTicketType(ctx.app, organizer.accessToken, eventId, {
      name: 'Pista',
      price: 40,
      totalQuantity,
      endDate: startDate,
    })

    expect(res.status).toBe(201)
    expect(res.body.data.totalQuantity).toBe(totalQuantity)
    expect(Number(res.body.data.availableQuantity)).toBe(totalQuantity)
  })
})
