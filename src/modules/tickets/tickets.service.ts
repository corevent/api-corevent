import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { createHash } from 'crypto'
import { EntityManager, FindOptionsWhere, Repository, SelectQueryBuilder } from 'typeorm'
import { createPaginationMeta } from '~/common/pagination/pagination-meta.factory'
import { getOffset } from '~/common/utils/get-offset.util'
import { decryptQrToken } from '~/common/utils/qr-code-crypto.util'
import { EventStaffService } from '~/modules/event-staff/event-staff.service'
import { EventsService } from '~/modules/events-module/events.service'
import { OrderStatus } from '~/modules/orders/orders.entity'
import { DecreaseTicketTypeQuantityItem } from '~/modules/ticket-types/interfaces/decrease-ticket'
import {
  CheckinDataDto,
  CheckinResponseDto,
  EventParticipantDetailsDataDto,
  EventParticipantDetailsResponseDto,
  EventParticipantDto,
  EventParticipantTicketDto,
  MyTicketsResponseDto,
  PaginateEventParticipantsDto,
  PaginateMyTicketsDto,
  QueryEventParticipantsDto,
  QueryMyTicketsDto,
  UserTicketDataDto,
} from '~/modules/tickets/dto/tickets.dto'
import { CreateTicket } from '~/modules/tickets/interfaces/tickets.interface'
import { Tickets, TicketStatus } from '~/modules/tickets/tickets.entity'
import { UsersService } from '~/modules/users/users.service'

interface EventParticipantRawRow {
  userId: string
  userName: string
  userEmail: string
  ticketsCount: string
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Tickets)
    private ticketsRepository: Repository<Tickets>,
    private configService: ConfigService,
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

  async getMyTicketsByEvent(userId: string, eventId: string): Promise<MyTicketsResponseDto> {
    const tickets = await this.ticketsRepository.find({
      where: { userId, eventId },
      relations: ['ticketType', 'order', 'event'],
      order: { createdAt: 'ASC' },
    })

    return { data: tickets.map((ticket) => this.mapUserTicket(ticket)) }
  }

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

  async getMyTickets(userId: string, query: QueryMyTicketsDto): Promise<PaginateMyTicketsDto> {
    const { page, limit, eventId } = query
    const where: FindOptionsWhere<Tickets> = { userId }

    if (eventId) {
      where.eventId = eventId
    }

    const [tickets, total] = await this.ticketsRepository.findAndCount({
      where,
      relations: ['ticketType', 'order', 'event'],
      skip: getOffset(page, limit),
      take: limit,
      order: { createdAt: 'DESC' },
    })

    return {
      data: tickets.map((ticket) => this.mapUserTicket(ticket)),
      meta: createPaginationMeta(page, limit, total),
    }
  }

  async createTicket(body: CreateTicket, manager?: EntityManager): Promise<Tickets> {
    const repository = manager ? manager.getRepository(Tickets) : this.ticketsRepository
    const ticket = repository.create(body)
    return repository.save(ticket)
  }

  async hasUserTicketForTicketType(userId: string, ticketTypeId: string): Promise<boolean> {
    const count = await this.ticketsRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.order', 'order')
      .where('ticket.userId = :userId', { userId })
      .andWhere('ticket.ticketTypeId = :ticketTypeId', { ticketTypeId })
      .andWhere('order.status != :cancelledOrder', { cancelledOrder: OrderStatus.CANCELLED })
      .andWhere('ticket.status != :cancelledTicket', { cancelledTicket: TicketStatus.CANCELLED })
      .getCount()

    return count > 0
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

  private mapUserTicket(ticket: Tickets): UserTicketDataDto {
    return plainToInstance(UserTicketDataDto, {
      id: ticket.id,
      eventId: ticket.eventId,
      ticketTypeId: ticket.ticketTypeId,
      status: ticket.status,
      checkinAt: ticket.checkinAt,
      qrToken: this.decryptQrToken(ticket.qrCodeEncryptedToken),
      ticketType: {
        id: ticket.ticketType.id,
        name: ticket.ticketType.name,
        price: Number(ticket.ticketType.price),
      },
      event: {
        id: ticket.event.id,
        title: ticket.event.title,
      },
      order: {
        id: ticket.order.id,
        status: ticket.order.status,
      },
    })
  }

  private decryptQrToken(encryptedToken: string): string {
    const secret = this.configService.get<string>('QR_CODE_SECRET')
    if (!secret) {
      throw new InternalServerErrorException('Missing QR_CODE_SECRET configuration')
    }

    try {
      return decryptQrToken(encryptedToken, secret)
    } catch {
      throw new InternalServerErrorException('Invalid QR code encrypted token format')
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

  private async validateCheckinPermission(userId: string, eventId: string): Promise<void> {
    const { data: event } = await this.eventsService.getById(eventId)
    if (event.organizer.id === userId) return
    await this.eventStaffService.validateStaff(userId, eventId)
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
