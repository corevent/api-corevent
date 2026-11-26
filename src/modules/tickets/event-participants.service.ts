import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { createPaginationMeta } from '~/common/pagination/pagination-meta.factory'
import { getOffset } from '~/common/utils/get-offset.util'
import { EventStaffService } from '~/modules/event-staff/event-staff.service'
import { OrderStatus } from '~/modules/orders/orders.entity'
import {
  EventParticipantDetailsDataDto,
  EventParticipantDetailsResponseDto,
  EventParticipantDto,
  EventParticipantTicketDto,
  PaginateEventParticipantsDto,
  QueryEventParticipantsDto,
} from '~/modules/tickets/dto/tickets.dto'
import { Tickets, TicketStatus } from '~/modules/tickets/tickets.entity'

interface EventParticipantRawRow {
  userId: string
  userName: string
  userEmail: string
  ticketsCount: string
}

@Injectable()
export class EventParticipantsService {
  constructor(
    @InjectRepository(Tickets)
    private readonly ticketsRepository: Repository<Tickets>,
    private readonly eventStaffService: EventStaffService,
  ) {}

  async getEventParticipants(
    requesterUserId: string,
    eventId: string,
    query: QueryEventParticipantsDto,
  ): Promise<PaginateEventParticipantsDto> {
    await this.validateEventAccess(requesterUserId, eventId)

    const { page, limit } = query
    const baseConditions = this.buildParticipantTicketsQuery(eventId)

    const totalResult = await baseConditions
      .clone()
      .select('COUNT(DISTINCT user.id)', 'count')
      .getRawOne<{ count: string }>()

    const total = Number(totalResult?.count ?? 0)

    const rows = await baseConditions
      .clone()
      .select('user.id', 'userId')
      .addSelect('user.name', 'userName')
      .addSelect('user.email', 'userEmail')
      .addSelect('COUNT(ticket.id)', 'ticketsCount')
      .groupBy('user.id')
      .addGroupBy('user.name')
      .addGroupBy('user.email')
      .orderBy('user.name', 'ASC')
      .offset(getOffset(page, limit))
      .limit(limit)
      .getRawMany<EventParticipantRawRow>()

    return {
      data: rows.map((row) => this.mapEventParticipant(row)),
      meta: createPaginationMeta(page, limit, total),
    }
  }

  async getEventParticipantDetails(
    requesterUserId: string,
    eventId: string,
    participantUserId: string,
  ): Promise<EventParticipantDetailsResponseDto> {
    await this.validateEventAccess(requesterUserId, eventId)

    const tickets = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.order', 'order')
      .innerJoinAndSelect('ticket.user', 'user')
      .innerJoinAndSelect('ticket.ticketType', 'ticketType')
      .where('ticket.eventId = :eventId', { eventId })
      .andWhere('ticket.userId = :participantUserId', { participantUserId })
      .andWhere('order.status = :paidStatus', { paidStatus: OrderStatus.PAID })
      .andWhere('ticket.status != :cancelledTicket', { cancelledTicket: TicketStatus.CANCELLED })
      .orderBy('ticket.createdAt', 'ASC')
      .getMany()

    if (tickets.length === 0) {
      throw new NotFoundException('Participant not found')
    }

    const { user } = tickets[0]

    return {
      data: plainToInstance(EventParticipantDetailsDataDto, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        tickets: tickets.map((ticket) => this.mapEventParticipantTicket(ticket)),
      }),
    }
  }

  private buildParticipantTicketsQuery(eventId: string): SelectQueryBuilder<Tickets> {
    return this.applyParticipantTicketFilters(
      this.ticketsRepository
        .createQueryBuilder('ticket')
        .innerJoin('ticket.order', 'order')
        .innerJoin('ticket.user', 'user'),
      eventId,
    )
  }

  private applyParticipantTicketFilters(
    query: SelectQueryBuilder<Tickets>,
    eventId: string,
  ): SelectQueryBuilder<Tickets> {
    return query
      .where('ticket.eventId = :eventId', { eventId })
      .andWhere('order.status = :paidStatus', { paidStatus: OrderStatus.PAID })
      .andWhere('ticket.status != :cancelledTicket', { cancelledTicket: TicketStatus.CANCELLED })
  }

  private async validateEventAccess(userId: string, eventId: string): Promise<void> {
    await this.eventStaffService.validateOrganizerOrStaff(userId, eventId)
  }

  private mapEventParticipant(row: EventParticipantRawRow): EventParticipantDto {
    return plainToInstance(EventParticipantDto, {
      id: row.userId,
      name: row.userName,
      email: row.userEmail,
      ticketsCount: Number(row.ticketsCount),
    })
  }

  private mapEventParticipantTicket(ticket: Tickets): EventParticipantTicketDto {
    return plainToInstance(EventParticipantTicketDto, {
      id: ticket.id,
      status: ticket.status,
      checkinAt: ticket.checkinAt,
      createdAt: ticket.createdAt,
      ticketType: {
        id: ticket.ticketType.id,
        name: ticket.ticketType.name,
        price: Number(ticket.ticketType.price),
      },
      order: {
        id: ticket.order.id,
        status: ticket.order.status,
      },
    })
  }
}
