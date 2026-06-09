import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { createHash } from 'crypto'
import { Repository } from 'typeorm'
import { EventStaffService } from '~/modules/event-staff/event-staff.service'
import { EventsService } from '~/modules/events-module/events.service'
import { OrderStatus } from '~/modules/orders/orders.entity'
import { DecreaseTicketTypeQuantityItem } from '~/modules/ticket-types/interfaces/decrease-ticket'
import { CheckinDataDto, CheckinResponseDto } from '~/modules/tickets/dto/tickets.dto'
import { CreateTicket } from '~/modules/tickets/interfaces/tickets.interface'
import { Tickets, TicketStatus } from '~/modules/tickets/tickets.entity'
import { UsersService } from '~/modules/users/users.service'

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Tickets)
    private ticketsRepository: Repository<Tickets>,
    private eventsService: EventsService,
    private eventStaffService: EventStaffService,
    private usersService: UsersService,
  ) {}

  async getTicketTypeQuantitiesByOrderId(orderId: string): Promise<DecreaseTicketTypeQuantityItem[]> {
    const tickets = await this.ticketsRepository.find({
      where: { orderId },
      select: ['ticketTypeId'],
    })

    const quantityByTicketType = tickets.reduce<Map<string, number>>((acc, ticket) => {
      acc.set(ticket.ticketTypeId, (acc.get(ticket.ticketTypeId) ?? 0) + 1)
      return acc
    }, new Map())

    return Array.from(quantityByTicketType, ([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }))
  }

  async getByOrderId(orderId: string): Promise<Tickets[]> {
    return this.ticketsRepository.find({
      where: { orderId },
      relations: ['ticketType'],
      order: { createdAt: 'ASC' },
    })
  }

  async createTicket(body: CreateTicket): Promise<Tickets> {
    const ticket = this.ticketsRepository.create(body)
    return this.ticketsRepository.save(ticket)
  }

  async checkin(staffUserId: string, eventId: string, qrToken: string): Promise<CheckinResponseDto> {
    await this.validateCheckinPermission(staffUserId, eventId)

    const qrCodeHash = createHash('sha256').update(qrToken).digest('hex')
    const ticket = await this.ticketsRepository.findOne({
      where: { qrCodeHash },
      relations: ['order', 'order.user', 'order.event', 'ticketType'],
    })

    if (!ticket) {
      throw new NotFoundException('Invalid QR code')
    }

    this.ticketValidations(eventId, ticket)

    const { data: staffUser } = await this.usersService.getById(staffUserId)

    ticket.status = TicketStatus.CHECKED_IN
    ticket.checkinAt = new Date()
    ticket.checkinBy = staffUserId

    const savedTicket = await this.ticketsRepository.save(ticket)
    return {
      data: this.mapCheckinResponse(savedTicket, { id: staffUser.id, name: staffUser.name }),
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

  private async validateCheckinPermission(userId: string, eventId: string): Promise<void> {
    const { data: event } = await this.eventsService.getById(eventId)
    if (event.organizer.id === userId) return
    await this.eventStaffService.validateStaff(userId, eventId)
  }

  private ticketValidations(eventId: string, ticket: Tickets): void {
    if (ticket.eventId !== eventId) {
      throw new BadRequestException('Ticket does not belong to this event')
    }

    if (ticket.status === TicketStatus.CANCELLED) {
      throw new BadRequestException('Ticket is cancelled')
    }

    if (ticket.status === TicketStatus.CHECKED_IN) {
      throw new ConflictException('Ticket already checked in')
    }

    // When the payment webhook exists
    if (ticket.order.status !== OrderStatus.PAID) {
      throw new BadRequestException('Order is not paid')
    }
  }
}
