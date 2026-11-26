import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { hasValue } from '~/common/utils/has-value.util'
import { EventChangesService } from '~/modules/event-changes/event-changes.service'
import {
  CreateEventDto,
  EventDataDto,
  EventResponseDto,
  PaginateEventsDto,
  QueryEventsDto,
  UpdateEventDto,
} from '~/modules/events-module/dto/events.dto'
import { EventsCancelService } from '~/modules/events-module/events-cancel.service'
import { EventLocationType, Events, EventStatus } from '~/modules/events-module/events.entity'
import { EventsQueryService } from '~/modules/events-module/events-query.service'
import { OrganizerPaymentInfoService } from '~/modules/organizer-payment-info/organizer-payment-info.service'
import { StorageService } from '~/modules/storage/storage.service'

const relevantAddressFields = ['cityId', 'zipCode', 'neighborhood', 'street', 'number', 'locationName']

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Events)
    private readonly eventsRepository: Repository<Events>,
    private readonly eventChangesService: EventChangesService,
    private readonly organizerPaymentInfoService: OrganizerPaymentInfoService,
    @Inject(forwardRef(() => StorageService))
    private readonly storageService: StorageService,
    private readonly eventsQueryService: EventsQueryService,
    private readonly eventsCancelService: EventsCancelService,
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

  async updateBanner(organizerId: string, eventId: string, key: string): Promise<EventResponseDto> {
    await this.assertUserIsOrganizer(organizerId, eventId)
    const storedKey = await this.storageService.confirmEventBannerUpload(eventId, key)
    const event = await this.eventsRepository.findOne({ where: { id: eventId } })
    if (!event) {
      throw new NotFoundException('Event not found')
    }
    if (event.bannerKey && event.bannerKey !== storedKey) {
      await this.storageService.deleteStoredImage(event.bannerKey)
    }
    await this.eventsRepository.update(eventId, { bannerKey: storedKey })
    return this.getById(eventId)
  }

  async getAll(
    queryParams: QueryEventsDto,
    userId?: string,
    type?: 'organizer' | 'staff' | 'favorite',
  ): Promise<PaginateEventsDto> {
    return this.eventsQueryService.getAll(queryParams, userId, type)
  }

  async getById(id: string, viewerId?: string): Promise<EventResponseDto> {
    return this.eventsQueryService.getById(id, viewerId)
  }

  async assertUserIsOrganizer(userId: string, eventId: string): Promise<void> {
    const { data: event } = await this.getById(eventId)
    this.validateOrganizer(userId, event)
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
    return this.eventsCancelService.cancel(organizerId, id)
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
  }

  private async validateBeforeUpdate(organizerId: string, id: string, body: UpdateEventDto): Promise<void> {
    const { data: event } = await this.getById(id)
    this.validateOrganizer(organizerId, event)

    const effectiveStartDate = body.startDate ?? event.startDate
    const effectiveEndDate = body.endDate ?? event.endDate
    if (body.startDate || body.endDate) {
      this.checkDates(effectiveStartDate, effectiveEndDate)
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

  private checkIfHasPhysicalAddress(body: CreateEventDto | UpdateEventDto, oldLocationType?: EventLocationType): void {
    const onlineStatus = EventLocationType.ONLINE

    if (body instanceof UpdateEventDto) {
      if (!body.locationType) return

      if (oldLocationType !== onlineStatus && body.locationType === onlineStatus) {
        throw new BadRequestException('Online events cannot be updated to physical address')
      }
    }

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
}
