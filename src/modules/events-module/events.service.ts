import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { SelectQueryBuilder } from 'typeorm/browser'
import { createPaginationMeta } from '~/common/pagination/pagination-meta.factory'
import { getOffset } from '~/common/utils/get-offset.util'
import { hasValue } from '~/common/utils/has-value.util'
import { EventChangesService } from '~/modules/event-changes/event-changes.service'
import {
  CreateEventDto,
  EventDataDto,
  QueryEventsDto,
  ListEventsDto,
  PaginateEventsDto,
  EventResponseDto,
  UpdateEventDto,
} from '~/modules/events-module/dto/events.dto'
import { EventLocationType, Events, EventStatus } from '~/modules/events-module/events.entity'
import { OrganizerPaymentInfoService } from '~/modules/organizer-payment-info/organizer-payment-info.service'

const relevantAddressFields = ['cityId', 'zipCode', 'neighborhood', 'street', 'number', 'locationName']

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Events)
    private readonly eventsRepository: Repository<Events>,
    private readonly eventChangesService: EventChangesService,
    private readonly organizerPaymentInfoService: OrganizerPaymentInfoService,
  ) {}

  async create(organizerId: string, body: CreateEventDto): Promise<EventResponseDto> {
    await this.organizerPaymentInfoService.getByUserId(organizerId)
    this.checkDates(body.startDate, body.endDate)
    this.checkIfHasPhysicalAddress(body)
    const instance = this.eventsRepository.create({ ...body, organizerId })
    const event = await this.eventsRepository.save(instance)
    return { data: plainToInstance(EventDataDto, event) }
  }

  async update(organizerId: string, id: string, body: UpdateEventDto): Promise<EventResponseDto> {
    await this.validateBeforeUpdate(organizerId, id, body)
    await this.eventsRepository.update(id, body)
    return this.getById(id)
  }

  async getAll(
    queryParams: QueryEventsDto,
    userId?: string,
    type?: 'organizer' | 'staff' | 'favorite',
  ): Promise<PaginateEventsDto> {
    const { page, limit, status } = queryParams
    const query = this.buildBaseQuery()
      .limit(limit)
      .offset(getOffset(page, limit))
      .where('e.status = :status', { status })
    this.applyFilters(query, queryParams)
    this.applySearch(query, queryParams.search)
    this.applyTypeOfList(query, userId, type)

    const [list, total] = await query.getManyAndCount()
    return {
      data: plainToInstance(ListEventsDto, list),
      meta: createPaginationMeta(page, limit, total),
    }
  }

  async getById(id: string): Promise<EventResponseDto> {
    const event = await this.buildBaseQuery().where('e.id = :id', { id }).getOne()
    if (!event) {
      throw new NotFoundException('Event not found')
    }
    return { data: plainToInstance(EventDataDto, event) }
  }

  async delete(organizerId: string, id: string): Promise<void> {
    const { data: event } = await this.getById(id)
    this.validateOrganizer(organizerId, event)
    if (event.status !== EventStatus.DRAFT) {
      throw new BadRequestException('Event cannot be deleted because it is not draft')
    }
    await this.eventsRepository.delete(id)
  }

  async cancel(organizerId: string, id: string): Promise<void> {
    const { data: event } = await this.getById(id)
    this.validateOrganizer(organizerId, event)
    if (event.status === EventStatus.OPENED || event.status === EventStatus.GOING) {
      await this.eventsRepository.update(id, { status: EventStatus.CANCELED })
      await this.eventChangesService.create(organizerId, id, {
        changedFields: ['status'],
        oldValue: { status: event.status },
        newValue: { status: EventStatus.CANCELED },
      })
      // TODO: refund payments
    } else {
      const statusMessage = {
        [EventStatus.DRAFT]: 'Event cannot be cancelled because it is draft, delete instead',
        [EventStatus.FINISHED]: 'Event cannot be cancelled because it is finished',
        [EventStatus.CANCELED]: 'Event already cancelled',
      }
      throw new BadRequestException(statusMessage[event.status])
    }
  }

  private checkDates(startDate: Date, endDate: Date): void {
    if (new Date() >= startDate) {
      throw new BadRequestException('Start date must be after today')
    }

    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date')
    }
  }

  private serializeComparableFieldValue(value: unknown): string {
    if (value instanceof Date) {
      return value.toISOString()
    }
    if (value === null || value === undefined) {
      return ''
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    return JSON.stringify(value)
  }

  private async dealWithRelevantChanges(data: EventDataDto, body: UpdateEventDto): Promise<void> {
    const relevantFields = new Set(['title', 'startDate', 'endDate', 'maxParticipants', ...relevantAddressFields])

    const relevantChangedFields = Object.keys(body).filter((key) => {
      if (!relevantFields.has(key)) return false
      const previous = data[key as keyof EventDataDto]
      const next = body[key as keyof UpdateEventDto]
      return this.serializeComparableFieldValue(previous) !== this.serializeComparableFieldValue(next)
    })

    if (relevantChangedFields.length === 0) return

    const oldValue = Object.fromEntries(relevantChangedFields.map((f) => [f, data[f as keyof EventDataDto]]))
    const newValue = Object.fromEntries(relevantChangedFields.map((f) => [f, body[f as keyof UpdateEventDto]]))

    await this.eventChangesService.create(data.organizer.id, data.id, {
      changedFields: relevantChangedFields,
      oldValue,
      newValue,
    })

    // TODO: deal with relevant changes (refund, send email, notification, etc.)
  }

  private async validateBeforeUpdate(organizerId: string, id: string, body: UpdateEventDto): Promise<void> {
    const { data: event } = await this.getById(id)
    this.validateOrganizer(organizerId, event)

    if (body.startDate && body.endDate) {
      this.checkDates(body.startDate, body.endDate)
    }

    const statusToBlock = [EventStatus.GOING, EventStatus.FINISHED, EventStatus.CANCELED]

    if (new Date() > event.startDate && statusToBlock.includes(event.status)) {
      const statusMessage = event.status === EventStatus.GOING ? 'started' : event.status
      throw new BadRequestException(`Event cannot be updated because it has already ${statusMessage}`)
    }

    if (event.status === EventStatus.OPENED && body.status === EventStatus.DRAFT) {
      throw new BadRequestException('Event cannot be updated to draft because it is published')
    }

    if (event.status === EventStatus.OPENED) {
      await this.dealWithRelevantChanges(event, body)
    }

    this.checkIfHasPhysicalAddress(body, event.locationType)
  }

  private applySearch(query: SelectQueryBuilder<Events>, search?: string): void {
    if (search) {
      query.andWhere('unaccent(e.title) ILIKE unaccent(:search)', { search: `%${search}%` })
    }
  }

  private applyFilters(query: SelectQueryBuilder<Events>, filters: QueryEventsDto): void {
    if (filters.stateId) {
      query.andWhere('e.cityId = :cityId', { cityId: filters.stateId })
    }
    if (filters.cityId) {
      query.andWhere('e.cityId = :cityId', { cityId: filters.cityId })
    }
    if (filters.startDate) {
      query.andWhere('e.startDate >= :startDate', { startDate: filters.startDate })
    }
    if (filters.category) {
      query.andWhere('e.category = :category', { category: filters.category })
    }
    if (filters.isAdultOnly) {
      query.andWhere('e.isAdultOnly = :isAdultOnly', { isAdultOnly: filters.isAdultOnly })
    }
  }

  private checkIfHasPhysicalAddress(body: CreateEventDto | UpdateEventDto, oldLocationType?: EventLocationType): void {
    const onlineStatus = EventLocationType.ONLINE

    // validations for UPDATE
    if (body instanceof UpdateEventDto) {
      if (!body.locationType) return

      if (oldLocationType !== onlineStatus && body.locationType === onlineStatus) {
        throw new BadRequestException('Online events cannot be updated to physical address')
      }
    }

    // validations for CREATE
    if (body instanceof CreateEventDto && body.locationType === onlineStatus) return

    const emptyFields = relevantAddressFields.filter((field) => !hasValue(body[field]))
    if (emptyFields.length > 0) {
      throw new BadRequestException(`Address fields are required for ${body.locationType}: ${emptyFields.join(', ')}`)
    }
  }

  private validateOrganizer(organizerId: string, event: EventDataDto): void {
    if (event.organizer.id !== organizerId) {
      throw new BadRequestException('You are not the organizer of this event')
    }
  }

  private buildBaseQuery(): SelectQueryBuilder<Events> {
    return this.eventsRepository
      .createQueryBuilder('e')
      .select([
        'e.id',
        'e.title',
        'e.maxParticipants',
        'c.name as cityName',
        's.acronym as stateAcronym',
        'e.locationName',
        'e.locationType',
        'e.startDate',
        'e.endDate',
        'e.category',
        'e.isAdultOnly',
        'e.status',
        'o.id',
        'o.name',
        'o.email',
        'o.avatarUrl',
      ])
      .innerJoin('e.organizer', 'o')
      .leftJoin('e.city', 'c')
      .leftJoin('c.state', 's')
  }

  private applyTypeOfList(
    query: SelectQueryBuilder<Events>,
    userId?: string,
    type?: 'organizer' | 'staff' | 'favorite',
  ): void {
    if (userId && !type) {
      throw new BadRequestException('Type is required when userId is provided')
    }
    if (!userId && type) {
      throw new BadRequestException('UserId is required when type is provided')
    }

    if (type === 'organizer') {
      query.andWhere('e.organizerId = :userId', { userId })
    }
    if (type === 'staff') {
      query.innerJoin('e.eventStaff', 'es').andWhere('es.userId = :userId', { userId })
    }
    if (type === 'favorite') {
      query.innerJoin('e.favorites', 'f').andWhere('f.userId = :userId', { userId })
    }
  }

  private applyFavoritesFilter(query: SelectQueryBuilder<Events>, userId?: string, isFavorite?: boolean): void {
    if (isFavorite === true) {
      query.innerJoin('e.favorites', 'f').andWhere('f.userId = :userId', { userId })
    }
  }
}
