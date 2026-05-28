import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { createPaginationMeta } from '~/common/pagination/pagination-meta.factory'
import { getOffset } from '~/common/utils/get-offset.util'
import { EventDataDto } from '~/modules/events-module/dto/events.dto'
import { EventStatus } from '~/modules/events-module/events.entity'
import { EventsService } from '~/modules/events-module/events.service'
import {
  CreateTicketTypeDto,
  PaginatedTicketTypesListDto,
  QueryTicketTypesDto,
  TicketTypeDataDto,
  TicketTypeResponseDto,
  UpdateTicketTypeDto,
} from '~/modules/ticket-types/dto/ticket-types.dto'
import { TicketTypes } from '~/modules/ticket-types/ticket-types.entity'

@Injectable()
export class TicketTypesService {
  constructor(
    @InjectRepository(TicketTypes)
    private ticketTypesRepository: Repository<TicketTypes>,
    private eventsService: EventsService,
  ) {}

  async create(userId: string, eventId: string, body: CreateTicketTypeDto): Promise<TicketTypeResponseDto> {
    await this.checkCapacityAndEvent(userId, eventId, body)
    const ticketType = this.ticketTypesRepository.create({ ...body, eventId, availableQuantity: body.totalQuantity })
    const data = await this.ticketTypesRepository.save(ticketType)
    return { data: plainToInstance(TicketTypeDataDto, data) }
  }

  async update(userId: string, ticketTypeId: string, body: UpdateTicketTypeDto): Promise<TicketTypeResponseDto> {
    const { data: ticketType } = await this.getById(ticketTypeId)
    await this.checkCapacityAndEvent(userId, ticketType.eventId, body)
    await this.ticketTypesRepository.update(ticketTypeId, body)
    return this.getById(ticketTypeId)
  }

  async getAll(eventId: string, queryParams: QueryTicketTypesDto): Promise<PaginatedTicketTypesListDto> {
    const { page, limit, ...filters } = queryParams
    const query = this.ticketTypesRepository
      .createQueryBuilder('tt')
      .where('tt.eventId = :eventId', { eventId })
      .limit(limit)
      .offset(getOffset(page, limit))
      .orderBy('tt.startDate', 'ASC')
    this.applyFilters(query, filters)

    const [list, total] = await query.getManyAndCount()
    return {
      data: plainToInstance(TicketTypeDataDto, list),
      meta: createPaginationMeta(page, limit, total),
    }
  }

  async getById(ticketTypeId: string): Promise<TicketTypeResponseDto> {
    const ticketType = await this.ticketTypesRepository.findOne({ where: { id: ticketTypeId } })
    if (!ticketType) {
      throw new NotFoundException('Ticket type not found')
    }
    return { data: plainToInstance(TicketTypeDataDto, ticketType) }
  }

  async delete(userId: string, ticketTypeId: string): Promise<void> {
    const { data: ticketType } = await this.getById(ticketTypeId)
    await this.checkEventStatusAndOrganizer(userId, ticketType.eventId, 'delete')
    const { affected } = await this.ticketTypesRepository.delete(ticketTypeId)
    if (affected === 0) {
      throw new NotFoundException('Ticket type not found')
    }
  }

  private async checkCapacityAndEvent(
    userId: string,
    eventId: string,
    body: CreateTicketTypeDto | UpdateTicketTypeDto,
  ): Promise<void> {
    const { data: event } = await this.eventsService.getById(eventId)
    const totalCapacity = event.maxParticipants

    const summedTotalQuantity = (await this.ticketTypesRepository.sum('totalQuantity', { eventId })) ?? 0
    if (totalCapacity < summedTotalQuantity + (body.totalQuantity ?? 0)) {
      throw new BadRequestException('Event capacity is not enough for the ticket types')
    }

    const type = body instanceof CreateTicketTypeDto ? 'create' : 'update'
    await this.checkEventStatusAndOrganizer(userId, eventId, type)

    this.checkDates(body.startDate, body.endDate, event)
  }

  private checkDates(startDate?: Date, endDate?: Date, event?: EventDataDto): void {
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('Start date must be before end date')
    }

    if (startDate && endDate && event && (startDate < event.startDate || endDate > event.endDate)) {
      throw new BadRequestException('Ticket type dates must be within the event dates')
    }
  }

  private applyFilters(query: SelectQueryBuilder<TicketTypes>, filters: Partial<QueryTicketTypesDto>): void {
    const { name, startDate, endDate, availableOnly } = filters

    if (availableOnly === true) {
      query.andWhere('tt.startDate <= NOW() AND tt.endDate >= NOW()')
    }
    if (name) {
      query.andWhere('unaccent(tt.name) ILIKE unaccent(:name)', { name: `%${name}%` })
    }
    if (startDate) {
      query.andWhere('tt.startDate >= :startDate', { startDate })
    }
    if (endDate) {
      query.andWhere('tt.endDate <= :endDate', { endDate })
    }
  }

  private async checkEventStatusAndOrganizer(
    userId: string,
    eventId: string,
    type: 'create' | 'update' | 'delete',
  ): Promise<void> {
    const { data: event } = await this.eventsService.getById(eventId)
    if (event.status !== EventStatus.DRAFT) {
      throw new BadRequestException(`Cannot ${type} because event is not draft`)
    }

    if (event.organizer.id !== userId) {
      throw new BadRequestException('You are not the organizer of this event')
    }
  }
}
