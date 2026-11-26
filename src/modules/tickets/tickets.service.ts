import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm'
import { createPaginationMeta } from '~/common/pagination/pagination-meta.factory'
import { getOffset } from '~/common/utils/get-offset.util'
import { decryptQrToken } from '~/common/utils/qr-code-crypto.util'
import { OrderStatus } from '~/modules/orders/orders.entity'
import {
  CheckinResponseDto,
  EventParticipantDetailsResponseDto,
  MyTicketsResponseDto,
  PaginateEventParticipantsDto,
  PaginateMyTicketsDto,
  QueryEventParticipantsDto,
  QueryMyTicketsDto,
  UserTicketDataDto,
} from '~/modules/tickets/dto/tickets.dto'
import { EventParticipantsService } from '~/modules/tickets/event-participants.service'
import { CreateTicket } from '~/modules/tickets/interfaces/tickets.interface'
import { TicketsCheckinService } from '~/modules/tickets/tickets-checkin.service'
import { Tickets, TicketStatus } from '~/modules/tickets/tickets.entity'

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Tickets)
    private readonly ticketsRepository: Repository<Tickets>,
    private readonly configService: ConfigService,
    private readonly ticketsCheckinService: TicketsCheckinService,
    private readonly eventParticipantsService: EventParticipantsService,
  ) {}

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
    return this.eventParticipantsService.getEventParticipants(requesterUserId, eventId, query)
  }

  async getEventParticipantDetails(
    requesterUserId: string,
    eventId: string,
    participantUserId: string,
  ): Promise<EventParticipantDetailsResponseDto> {
    return this.eventParticipantsService.getEventParticipantDetails(requesterUserId, eventId, participantUserId)
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

  async hasUserTicketForTicketType(
    userId: string,
    ticketTypeId: string,
    manager?: EntityManager,
  ): Promise<boolean> {
    const repository = manager ? manager.getRepository(Tickets) : this.ticketsRepository
    const count = await repository
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
    return this.ticketsCheckinService.checkin(staffUserId, eventId, qrToken)
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
}
