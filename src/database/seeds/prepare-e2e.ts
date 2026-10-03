import { createHash, randomBytes, randomUUID } from 'crypto'
import * as bcrypt from 'bcryptjs'
import { encryptQrToken } from '~/common/utils/qr-code-crypto.util'
import dataSource from '~/database/data-source'
import { clearPreviousE2EData, E2E_EVENT_TITLE_PREFIX } from '~/database/seeds/prepare-e2e-cleanup'
import { EventCategory, EventLocationType, Events, EventStatus } from '~/modules/events-module/events.entity'
import { OrderItems } from '~/modules/orders/order-items.entity'
import { Orders, OrderStatus } from '~/modules/orders/orders.entity'
import { OrganizerPaymentInfo } from '~/modules/organizer-payment-info/organizer-payment-info.entity'
import { TicketTypes } from '~/modules/ticket-types/ticket-types.entity'
import { Tickets, TicketStatus } from '~/modules/tickets/tickets.entity'
import { DocumentType } from '~/modules/users/enums/document-type.enum'
import { Users } from '~/modules/users/users.entity'

async function run(): Promise<void> {
  // Check before connecting: this command must never write outside staging.
  if (process.env.NODE_ENV !== 'staging') {
    throw new Error('prepare-e2e requires NODE_ENV=staging')
  }
  const qrSecret = process.env.QR_CODE_SECRET
  if (!qrSecret) {
    throw new Error('QR_CODE_SECRET must match the staging API configuration')
  }

  const passwordHash = await bcrypt.hash('@Teste123', 10)
  const runId = randomUUID()
  await dataSource.initialize()
  try {
    const result = await dataSource.transaction(async (manager) => {
      // Keep the same account ID, restoring the requested fields on every run.
      await manager.upsert(
        Users,
        {
          name: 'Conta E2E',
          email: 'e2e@email.com',
          documentType: DocumentType.CPF,
          document: '55718617031',
          birthDate: '2000-01-01',
          passwordHash,
          avatarUrl: 'https://corevent.com/avatar.png',
        },
        ['email'],
      )
      const user = await manager.findOneByOrFail(Users, { email: 'e2e@email.com' })
      await clearPreviousE2EData(manager, user.id)

      if (!(await manager.existsBy(OrganizerPaymentInfo, { userId: user.id }))) {
        await manager.save(OrganizerPaymentInfo, {
          userId: user.id,
          description: 'Conta E2E',
          bankCode: '260',
          branchNumber: '1234',
          branchDigit: '5',
          accountNumber: '1234567890',
          accountDigit: '0',
          pixKey: user.document.trim(),
          pixType: 'cpf',
        })
      }

      const now = new Date()
      const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const event = await manager.save(Events, {
        organizerId: user.id,
        title: `${E2E_EVENT_TITLE_PREFIX}${runId}`,
        description: 'Evento preparado para os testes E2E do aplicativo mobile.',
        maxParticipants: 100,
        locationType: EventLocationType.ONLINE,
        locationName: 'Online',
        category: EventCategory.MUSIC,
        isAdultOnly: false,
        status: EventStatus.OPENED,
        startDate,
        endDate: new Date(startDate.getTime() + 2 * 60 * 60 * 1000),
        createdAt: now,
      })
      const freeTicket = await manager.save(TicketTypes, {
        eventId: event.id,
        name: 'Ingresso gratuito E2E',
        price: 0,
        totalQuantity: 40,
        availableQuantity: 40,
        startDate: now,
        endDate: startDate,
      })
      const paidTicket = await manager.save(TicketTypes, {
        eventId: event.id,
        name: 'Ingresso pago E2E',
        price: 49.9,
        totalQuantity: 40,
        availableQuantity: 39,
        startDate: now,
        endDate: startDate,
      })

      // Seed a confirmed purchase directly, without invoking PagBank or email.
      // The free type stays unused so its purchase E2E can run once for this user.
      const order = await manager.save(Orders, {
        userId: user.id,
        eventId: event.id,
        status: OrderStatus.PAID,
        totalAmount: paidTicket.price,
        gatewayTransactionId: null,
      })
      await manager.save(OrderItems, {
        orderId: order.id,
        ticketTypeId: paidTicket.id,
        quantity: 1,
      })
      const qrToken = randomBytes(32).toString('hex')
      const ticket = await manager.save(Tickets, {
        orderId: order.id,
        userId: user.id,
        eventId: event.id,
        ticketTypeId: paidTicket.id,
        status: TicketStatus.PENDING,
        qrCodeHash: createHash('sha256').update(qrToken).digest('hex'),
        qrCodeEncryptedToken: encryptQrToken(qrToken, qrSecret),
      })

      return {
        schemaVersion: 1,
        runId,
        userId: user.id,
        email: user.email,
        eventId: event.id,
        freeTicketName: freeTicket.name,
        freeTicketTypeId: freeTicket.id,
        paidTicketTypeId: paidTicket.id,
        orderId: order.id,
        ticketId: ticket.id,
      }
    })
    // Emitted only after commit; passwords, hashes, QR tokens and secrets stay out.
    console.log(JSON.stringify(result))
  } finally {
    await dataSource.destroy()
  }
}

void run().catch((error: unknown) => {
  console.error(
    JSON.stringify({
      status: 'error',
      command: 'prepare-e2e',
      message: error instanceof Error ? error.message : 'Failed to prepare E2E data',
    }),
  )
  process.exitCode = 1
})
