import request from 'supertest'
import { EventCategory, EventLocationType } from '~/modules/events-module/events.entity'
import {
  bearer,
  checkin,
  createOrder,
  createOrganizerEvent,
  createTicketType,
  getOrder,
  openEvent,
  paidWebhookPayload,
  postPagBankWebhook,
  registerAndLogin,
  signWebhook,
} from './helpers/api'
import { daysFromNow } from './helpers/fixtures'
import { setupE2EApp } from './helpers/setup-e2e-app'

/**
 * Local data population for corevent-analytics (Postgres path).
 * Creates diverse users/events/tickets/orders/favorites/ratings/check-ins.
 * Leaves rows in the local DB (e2e suite does not wipe engagement data).
 */
describe('Analytics local data population', () => {
  const ctx = setupE2EApp()

  const birthDates = [
    '1972-03-14',
    '1978-11-02',
    '1983-07-21',
    '1987-01-09',
    '1990-05-30',
    '1992-12-18',
    '1995-08-04',
    '1998-02-27',
    '2000-09-15',
    '2002-06-08',
    '2004-04-19',
    '2005-10-01',
  ]

  const eventBlueprints: Array<{
    category: EventCategory
    locationType: EventLocationType
    isAdultOnly: boolean
    maxParticipants: number
    startOffsetDays: number
    durationHours: number
    paidPrice: number
    paidQuantity: number
    freeQuantity: number
    locationName: string
    cityId?: number
    zipCode?: string
    neighborhood?: string
    street?: string
    number?: number
  }> = [
    {
      category: EventCategory.MUSIC,
      locationType: EventLocationType.IN_PERSON,
      isAdultOnly: true,
      maxParticipants: 800,
      startOffsetDays: 14,
      durationHours: 6,
      paidPrice: 120,
      paidQuantity: 50,
      freeQuantity: 5,
      locationName: 'Arena Central',
      cityId: 3550308,
      zipCode: '01310100',
      neighborhood: 'Bela Vista',
      street: 'Av. Paulista',
      number: 1000,
    },
    {
      category: EventCategory.GASTRONOMY,
      locationType: EventLocationType.IN_PERSON,
      isAdultOnly: false,
      maxParticipants: 200,
      startOffsetDays: 21,
      durationHours: 4,
      paidPrice: 85,
      paidQuantity: 40,
      freeQuantity: 8,
      locationName: 'Mercado Municipal',
      cityId: 3304557,
      zipCode: '20040020',
      neighborhood: 'Centro',
      street: 'Rua da Quitanda',
      number: 50,
    },
    {
      category: EventCategory.ART_CULTURE,
      locationType: EventLocationType.HYBRID,
      isAdultOnly: false,
      maxParticipants: 150,
      startOffsetDays: 35,
      durationHours: 3,
      paidPrice: 45,
      paidQuantity: 60,
      freeQuantity: 15,
      locationName: 'Museu da Cidade',
      cityId: 3106200,
      zipCode: '30130100',
      neighborhood: 'Savassi',
      street: 'Rua da Bahia',
      number: 1200,
    },
    {
      category: EventCategory.TECH,
      locationType: EventLocationType.ONLINE,
      isAdultOnly: false,
      maxParticipants: 1000,
      startOffsetDays: 10,
      durationHours: 8,
      paidPrice: 199,
      paidQuantity: 80,
      freeQuantity: 20,
      locationName: 'Stream Tech Week',
    },
    {
      category: EventCategory.BUSINESS,
      locationType: EventLocationType.HYBRID,
      isAdultOnly: false,
      maxParticipants: 400,
      startOffsetDays: 45,
      durationHours: 9,
      paidPrice: 350,
      paidQuantity: 30,
      freeQuantity: 0,
      locationName: 'Centro de Convenções',
      cityId: 4106902,
      zipCode: '80010000',
      neighborhood: 'Centro',
      street: 'Rua XV de Novembro',
      number: 700,
    },
    {
      category: EventCategory.EDUCATION,
      locationType: EventLocationType.ONLINE,
      isAdultOnly: false,
      maxParticipants: 500,
      startOffsetDays: 28,
      durationHours: 2,
      paidPrice: 29.9,
      paidQuantity: 100,
      freeQuantity: 25,
      locationName: 'Campus Virtual',
    },
    {
      category: EventCategory.SPORTS,
      locationType: EventLocationType.IN_PERSON,
      isAdultOnly: false,
      maxParticipants: 300,
      startOffsetDays: 7,
      durationHours: 5,
      paidPrice: 60,
      paidQuantity: 70,
      freeQuantity: 10,
      locationName: 'Ginásio Norte',
      cityId: 2304400,
      zipCode: '60165082',
      neighborhood: 'Meireles',
      street: 'Av. Beira Mar',
      number: 3200,
    },
    {
      category: EventCategory.HEALTH_WELLNESS,
      locationType: EventLocationType.IN_PERSON,
      isAdultOnly: false,
      maxParticipants: 120,
      startOffsetDays: 18,
      durationHours: 2,
      paidPrice: 75,
      paidQuantity: 45,
      freeQuantity: 12,
      locationName: 'Parque das Águas',
      cityId: 4314902,
      zipCode: '90010150',
      neighborhood: 'Centro Histórico',
      street: 'Rua dos Andradas',
      number: 900,
    },
    {
      category: EventCategory.GAMES,
      locationType: EventLocationType.HYBRID,
      isAdultOnly: true,
      maxParticipants: 600,
      startOffsetDays: 40,
      durationHours: 12,
      paidPrice: 150,
      paidQuantity: 90,
      freeQuantity: 0,
      locationName: 'Expo Games Hall',
      cityId: 2927408,
      zipCode: '40020000',
      neighborhood: 'Comércio',
      street: 'Av. Sete de Setembro',
      number: 450,
    },
    {
      category: EventCategory.COMMUNITY_SOCIAL,
      locationType: EventLocationType.IN_PERSON,
      isAdultOnly: false,
      maxParticipants: 250,
      startOffsetDays: 12,
      durationHours: 3,
      paidPrice: 25,
      paidQuantity: 55,
      freeQuantity: 30,
      locationName: 'Praça da Liberdade',
      cityId: 2611606,
      zipCode: '50030230',
      neighborhood: 'Boa Vista',
      street: 'Rua da Aurora',
      number: 215,
    },
    {
      category: EventCategory.FAMILY_KIDS,
      locationType: EventLocationType.IN_PERSON,
      isAdultOnly: false,
      maxParticipants: 180,
      startOffsetDays: 16,
      durationHours: 4,
      paidPrice: 35,
      paidQuantity: 65,
      freeQuantity: 20,
      locationName: 'Parque Infantil',
      cityId: 5300108,
      zipCode: '70040902',
      neighborhood: 'Asa Sul',
      street: 'SQS 308',
      number: 1,
    },
    {
      category: EventCategory.FASHION_BEAUTY,
      locationType: EventLocationType.IN_PERSON,
      isAdultOnly: false,
      maxParticipants: 220,
      startOffsetDays: 50,
      durationHours: 5,
      paidPrice: 95,
      paidQuantity: 35,
      freeQuantity: 5,
      locationName: 'Fashion Hub',
      cityId: 3550308,
      zipCode: '01414001',
      neighborhood: 'Jardins',
      street: 'Rua Oscar Freire',
      number: 800,
    },
  ]

  it('populates diversified analytics data across core tables', async () => {
    const marketplaces: Array<{
      eventId: string
      paidTicketTypeId: string
      freeTicketTypeId: string | null
      category: EventCategory
      isAdultOnly: boolean
      organizerToken: string
      paidPrice: number
    }> = []

    for (let i = 0; i < eventBlueprints.length; i++) {
      const blueprint = eventBlueprints[i]
      const startDate = daysFromNow(blueprint.startOffsetDays)
      const endDate = new Date(startDate)
      endDate.setHours(endDate.getHours() + blueprint.durationHours)

      const organizerCtx = await createOrganizerEvent(ctx.app, {
        userOverrides: {
          name: `Organizer ${blueprint.category} ${i}`,
          birthDate: birthDates[i % birthDates.length],
        },
        eventOverrides: {
          title: `${blueprint.category} Experience ${i + 1}`,
          description: `Evento diversificado de ${blueprint.category} em ${blueprint.locationName}`,
          category: blueprint.category,
          locationType: blueprint.locationType,
          locationName: blueprint.locationName,
          isAdultOnly: blueprint.isAdultOnly,
          maxParticipants: blueprint.maxParticipants,
          startDate,
          endDate: endDate.toISOString(),
          ...(blueprint.cityId
            ? {
                cityId: blueprint.cityId,
                zipCode: blueprint.zipCode,
                neighborhood: blueprint.neighborhood,
                street: blueprint.street,
                number: blueprint.number,
              }
            : {}),
        },
      })

      const paidType = await createTicketType(ctx.app, organizerCtx.organizer.accessToken, organizerCtx.eventId, {
        name: `Pago ${blueprint.category}`,
        price: blueprint.paidPrice,
        totalQuantity: blueprint.paidQuantity,
        endDate: organizerCtx.startDate,
      })
      expect(paidType.status).toBe(201)

      let freeTicketTypeId: string | null = null
      if (blueprint.freeQuantity > 0) {
        const freeType = await createTicketType(ctx.app, organizerCtx.organizer.accessToken, organizerCtx.eventId, {
          name: `Cortesia ${blueprint.category}`,
          price: 0,
          totalQuantity: blueprint.freeQuantity,
          endDate: organizerCtx.startDate,
        })
        expect(freeType.status).toBe(201)
        freeTicketTypeId = freeType.body.data.id as string
      }

      const opened = await openEvent(ctx.app, organizerCtx.organizer.accessToken, organizerCtx.eventId)
      expect(opened.status).toBe(200)

      marketplaces.push({
        eventId: organizerCtx.eventId,
        paidTicketTypeId: paidType.body.data.id as string,
        freeTicketTypeId,
        category: blueprint.category,
        isAdultOnly: blueprint.isAdultOnly,
        organizerToken: organizerCtx.organizer.accessToken,
        paidPrice: blueprint.paidPrice,
      })
    }

    const buyers = []
    for (let i = 0; i < 30; i++) {
      buyers.push(
        await registerAndLogin(ctx.app, {
          name: `Buyer Analytics ${i}`,
          birthDate: birthDates[i % birthDates.length],
        }),
      )
    }

    let favoritesCreated = 0
    let ordersPaid = 0
    let freeOrders = 0
    let ratingsCreated = 0
    let checkinsCreated = 0

    for (let buyerIndex = 0; buyerIndex < buyers.length; buyerIndex++) {
      const buyer = buyers[buyerIndex]
      const primary = marketplaces[buyerIndex % marketplaces.length]
      const related = marketplaces[(buyerIndex + 3) % marketplaces.length]
      const extra = marketplaces[(buyerIndex + 7) % marketplaces.length]
      const favoriteTargets = [primary, related, extra].filter(
        (event, index, all) => all.findIndex((item) => item.eventId === event.eventId) === index,
      )

      for (const event of favoriteTargets) {
        const fav = await request(ctx.app.getHttpServer())
          .post(`/api/favorites/events/${event.eventId}`)
          .set(bearer(buyer.accessToken))
        if (fav.status === 201) {
          favoritesCreated += 1
        }
      }

      const canBuyAdult = birthDates[buyerIndex % birthDates.length] <= '2007-01-01'
      const shouldBuyPrimary = buyerIndex % 4 !== 0
      const shouldBuyRelated = buyerIndex % 5 === 0
      const shouldBuyFree = buyerIndex % 3 === 0 && primary.freeTicketTypeId

      const purchaseTargets = [
        shouldBuyPrimary ? primary : null,
        shouldBuyRelated ? related : null,
      ].filter((target): target is (typeof marketplaces)[number] => target !== null)

      for (const target of purchaseTargets) {
        if (target.isAdultOnly && !canBuyAdult) {
          continue
        }

        const quantity = (buyerIndex % 3) + 1
        const orderRes = await createOrder(
          ctx.app,
          buyer.accessToken,
          target.eventId,
          target.paidTicketTypeId,
          quantity,
        )
        expect(orderRes.status).toBe(201)
        const orderId = orderRes.body.data.orderId as string
        const rawBody = paidWebhookPayload(orderId)
        const webhook = await postPagBankWebhook(ctx.app, rawBody, signWebhook(rawBody))
        expect([200, 201]).toContain(webhook.status)
        ordersPaid += 1

        const details = await getOrder(ctx.app, buyer.accessToken, orderId)
        expect(details.status).toBe(200)
        const qrToken = details.body.data.tickets?.[0]?.qrToken as string | undefined

        if (qrToken && buyerIndex % 2 === 0) {
          const checkinRes = await checkin(ctx.app, target.eventId, qrToken, target.organizerToken)
          if (checkinRes.status === 200) {
            checkinsCreated += 1
          }
        }

        if (buyerIndex % 2 === 0) {
          const ratingValue = (buyerIndex % 5) + 1
          const rating = await request(ctx.app.getHttpServer())
            .post(`/api/events/${target.eventId}/ratings`)
            .set(bearer(buyer.accessToken))
            .send({ rating: ratingValue })
          if (rating.status === 201) {
            ratingsCreated += 1
          }
        }
      }

      if (shouldBuyFree && primary.freeTicketTypeId && (!primary.isAdultOnly || canBuyAdult)) {
        const freeOrder = await createOrder(
          ctx.app,
          buyer.accessToken,
          primary.eventId,
          primary.freeTicketTypeId,
          1,
        )
        if (freeOrder.status === 201) {
          freeOrders += 1
          const qrToken = freeOrder.body.data.qrCodes?.[0] as string | undefined
          if (qrToken && buyerIndex % 2 === 1) {
            const checkinRes = await checkin(ctx.app, primary.eventId, qrToken, primary.organizerToken)
            if (checkinRes.status === 200) {
              checkinsCreated += 1
            }
          }
        }
      }
    }

    expect(marketplaces).toHaveLength(eventBlueprints.length)
    expect(favoritesCreated).toBeGreaterThan(50)
    expect(ordersPaid).toBeGreaterThan(15)
    expect(freeOrders).toBeGreaterThan(3)
    expect(ratingsCreated).toBeGreaterThan(5)
    expect(checkinsCreated).toBeGreaterThan(5)
  }, 240_000)
})
