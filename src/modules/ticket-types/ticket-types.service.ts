import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm'
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
import { DecreaseTicketTypeQuantityItem } from '~/modules/ticket-types/interfaces/decrease-ticket'
import { TicketTypes } from '~/modules/ticket-types/ticket-types.entity'

@Injectable()
export class TicketTypesService {
  constructor(
    @InjectRepository(TicketTypes)
    private ticketTypesRepository: Repository<TicketTypes>,
    @Inject(forwardRef(() => EventsService))
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
    const mergedBody: UpdateTicketTypeDto = {
      ...body,
      startDate: body.startDate ?? ticketType.startDate,
      endDate: body.endDate ?? ticketType.endDate,
    }
    await this.checkCapacityAndEvent(userId, ticketType.eventId, mergedBody, ticketType.totalQuantity)

    if (body.totalQuantity !== undefined) {
      await this.updateWithQuantityAdjustment(ticketTypeId, ticketType, body)
    } else {
      await this.ticketTypesRepository.update(ticketTypeId, body)
    }

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

  async decreaseAvailableQuantity(items: DecreaseTicketTypeQuantityItem[], manager?: EntityManager): Promise<void> {
    const quantityByTicketType = this.aggregateQuantityByTicketType(items)
    const repository = manager ? manager.getRepository(TicketTypes) : this.ticketTypesRepository

    for (const [ticketTypeId, quantity] of quantityByTicketType) {
      const result = await repository
        .createQueryBuilder()
        .update(TicketTypes)
        .set({ availableQuantity: () => 'available_quantity - :quantity' })
        .where('id = :ticketTypeId', { ticketTypeId })
        .andWhere('available_quantity >= :quantity', { quantity })
        .setParameters({ quantity, ticketTypeId })
        .execute()

      if (!result.affected) {
        const { data: ticketType } = await this.getById(ticketTypeId)
        throw new BadRequestException(`Not enough tickets available for ${ticketType.name}`)
      }
    }
  }

  async increaseAvailableQuantity(items: DecreaseTicketTypeQuantityItem[], manager?: EntityManager): Promise<void> {
    const quantityByTicketType = this.aggregateQuantityByTicketType(items)
    const repository = manager ? manager.getRepository(TicketTypes) : this.ticketTypesRepository

    for (const [ticketTypeId, quantity] of quantityByTicketType) {
      await repository
        .createQueryBuilder()
        .update(TicketTypes)
        .set({ availableQuantity: () => 'available_quantity + :quantity' })
        .where('id = :ticketTypeId', { ticketTypeId })
        .setParameters({ quantity, ticketTypeId })
        .execute()
    }
  }

  async delete(userId: string, ticketTypeId: string): Promise<void> {
    const { data: ticketType } = await this.getById(ticketTypeId)
    await this.checkEventStatusAndOrganizer(userId, ticketType.eventId, 'delete')
    const { affected } = await this.ticketTypesRepository.delete(ticketTypeId)
    if (affected === 0) {
      throw new NotFoundException('Ticket type not found')
    }
  }

  private async updateWithQuantityAdjustment(
    ticketTypeId: string,
    current: TicketTypeDataDto,
    body: UpdateTicketTypeDto,
  ): Promise<void> {
    const newTotalQuantity = body.totalQuantity
    if (newTotalQuantity === undefined) {
      return
    }

    const delta = newTotalQuantity - current.totalQuantity
    const { totalQuantity: _ignoredTotal, ...otherFields } = body

    const result = await this.ticketTypesRepository
      .createQueryBuilder()
      .update(TicketTypes)
      .set({
        ...otherFields,
        totalQuantity: newTotalQuantity,
        availableQuantity: () => 'available_quantity + :delta',
      })
      .where('id = :ticketTypeId', { ticketTypeId })
      .andWhere('total_quantity - available_quantity <= :newTotal', { newTotal: newTotalQuantity })
      .setParameters({ delta, ticketTypeId, newTotal: newTotalQuantity })
      .execute()

    if (!result.affected) {
      throw new BadRequestException('Cannot reduce total quantity below the number of tickets already sold')
    }
  }

  private aggregateQuantityByTicketType(items: DecreaseTicketTypeQuantityItem[]): Map<string, number> {
    return items.reduce<Map<string, number>>((acc, item) => {
      acc.set(item.ticketTypeId, (acc.get(item.ticketTypeId) ?? 0) + item.quantity)
      return acc
    }, new Map())
  }

  private async checkCapacityAndEvent(
    userId: string,
    eventId: string,
    body: CreateTicketTypeDto | UpdateTicketTypeDto,
    oldTotalQuantity?: number,
  ): Promise<void> {
    const { data: event } = await this.eventsService.getById(eventId)
    const totalCapacity = event.maxParticipants

    const newTotalQuantity = body.totalQuantity ?? oldTotalQuantity ?? 0
    const summedTotalQuantity = (await this.ticketTypesRepository.sum('totalQuantity', { eventId })) ?? 0
    if (totalCapacity < summedTotalQuantity - (oldTotalQuantity ?? 0) + newTotalQuantity) {
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

    if (startDate && endDate && event && (startDate < event.createdAt || endDate > event.startDate)) {
      throw new BadRequestException('Ticket type dates must be within the event dates')
    }
  }

  private applyFilters(query: SelectQueryBuilder<TicketTypes>, filters: Partial<QueryTicketTypesDto>): void {
    const { name, startDate, endDate, availableOnly } = filters

    if (availableOnly === true) {
      query.andWhere('tt.startDate <= NOW() AND tt.endDate >= NOW() AND tt.available_quantity > 0')
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
