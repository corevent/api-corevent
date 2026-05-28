import { TicketStatus } from '~/modules/tickets/tickets.entity'

export interface CreateTicket {
  orderId: string
  userId: string
  ticketTypeId: string
  eventId: string
  qrCodeHash: string
  qrCodeEncryptedToken: string
  status: TicketStatus
}
