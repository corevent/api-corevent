import {
  createOrder,
  createOrderWithItems,
  createOrganizerEvent,
  createTicketType,
  openEvent,
  registerAndLogin,
  setupMarketplace,
} from './helpers/api'
import { errorText } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

describe('T58 - Regras de elegibilidade na compra', () => {
  const ctx = setupE2EApp()

  it('rejects underage buyer on adult-only event', async () => {
    const event = await createOrganizerEvent(ctx.app, {
      eventOverrides: { isAdultOnly: true },
    })

    const freeType = await createTicketType(ctx.app, event.organizer.accessToken, event.eventId, {
      name: 'Adult Free',
      price: 0,
      totalQuantity: 5,
      endDate: event.startDate,
    })
    expect(freeType.status).toBe(201)

    const opened = await openEvent(ctx.app, event.organizer.accessToken, event.eventId)
    expect(opened.status).toBe(200)

    const underage = await registerAndLogin(ctx.app, { birthDate: '2012-05-20' })
    const res = await createOrder(
      ctx.app,
      underage.accessToken,
      event.eventId,
      freeType.body.data.id as string,
    )

    expect(res.status).toBe(400)
    expect(errorText(res.body).toLowerCase()).toMatch(/at least 18/)
  })

  it('rejects mixing free and paid tickets in the same order', async () => {
    const market = await setupMarketplace(ctx.app)

    const res = await createOrderWithItems(ctx.app, market.buyer.accessToken, market.eventId, [
      { ticketTypeId: market.freeTicketTypeId, quantity: 1 },
      { ticketTypeId: market.paidTicketTypeId, quantity: 1 },
    ])

    expect(res.status).toBe(400)
    expect(errorText(res.body).toLowerCase()).toMatch(/cannot mix free and paid/)
  })
})
