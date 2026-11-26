import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { createHash } from 'crypto'
import { DataSource } from 'typeorm'
import { EventStaffService } from '~/modules/event-staff/event-staff.service'
import { EventStatus } from '~/modules/events-module/events.entity'
import { EventsService } from '~/modules/events-module/events.service'
import { OrderStatus } from '~/modules/orders/orders.entity'
import { CheckinDataDto, CheckinResponseDto } from '~/modules/tickets/dto/tickets.dto'
import { Tickets, TicketStatus } from '~/modules/tickets/tickets.entity'
import { UsersService } from '~/modules/users/users.service'

@Injectable()
export class TicketsCheckinService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly eventsService: EventsService,
    private readonly eventStaffService: EventStaffService,
    private readonly usersService: UsersService,
  ) {}

  async checkin(staffUserId: string, eventId: string, qrToken: string): Promise<CheckinResponseDto> {
    await this.validateCheckinPermission(staffUserId, eventId)

    const qrCodeHash = createHash('sha256').update(qrToken).digest('hex')
    const { data: staffUser } = await this.usersService.getById(staffUserId)

    return this.dataSource.transaction(async (manager) => {
      const ticket = await manager.findOne(Tickets, {
        where: { qrCodeHash },
        relations: ['order', 'order.user', 'order.event', 'ticketType'],
      })

      if (!ticket) {
        throw new NotFoundException('Invalid QR code')
      }

      this.ticketValidations(eventId, ticket)

      const checkinAt = new Date()
      const result = await manager
        .createQueryBuilder()
        .update(Tickets)
        .set({
          status: TicketStatus.CHECKED_IN,
          checkinAt,
          checkinBy: staffUserId,
        })
        .where('id = :id', { id: ticket.id })
        .andWhere('status = :pendingStatus', { pendingStatus: TicketStatus.PENDING })
        .execute()

      if (!result.affected) {
        throw new ConflictException('Ticket already checked in')
      }

      ticket.status = TicketStatus.CHECKED_IN
      ticket.checkinAt = checkinAt
      ticket.checkinBy = staffUserId

      return {
        data: this.mapCheckinResponse(ticket, { id: staffUser.id, name: staffUser.name }),
      }
    })
  }

  private async validateCheckinPermission(userId: string, eventId: string): Promise<void> {
    const { data: event } = await this.eventsService.getById(eventId)
    if (event.organizer.id === userId) return
    await this.eventStaffService.validateStaff(userId, eventId)
  }

  private ticketValidations(eventId: string, ticket: Tickets): void {
    if (ticket.eventId !== eventId) {
      throw new BadRequestException('Ticket does not belong to this event')
    }

    const eventStatus = ticket.order.event.status
    if (eventStatus !== EventStatus.OPENED && eventStatus !== EventStatus.GOING) {
      throw new BadRequestException('Check-in is only allowed for opened or going events')
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException('Ticket is cancelled')
    }

    if (ticket.status === TicketStatus.CHECKED_IN) {
      throw new ConflictException('Ticket already checked in')
    }

    if (ticket.order.status !== OrderStatus.PAID) {
      throw new BadRequestException('Order is not paid')
    }
  }

  private mapCheckinResponse(ticket: Tickets, checkedInByStaff: { id: string; name: string }): CheckinDataDto {
    const { order, ticketType } = ticket
    const checkedInBy = { id: checkedInByStaff.id, name: checkedInByStaff.name }

    return plainToInstance(CheckinDataDto, {
      ticketId: ticket.id,
      ticketTypeId: ticket.ticketTypeId,
      status: ticket.status,
      checkinAt: ticket.checkinAt,
      ticketType: {
        id: ticketType.id,
        name: ticketType.name,
        price: ticketType.price,
      },
      event: {
        id: order.event.id,
        title: order.event.title,
      },
      order: {
        id: order.id,
        status: order.status,
        gatewayTransactionId: order.gatewayTransactionId,
      },
      user: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
      },
      checkedInBy,
    })
  }
}
