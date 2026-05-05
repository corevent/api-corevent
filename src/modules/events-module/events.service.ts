import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { EventChangesService } from '~/modules/event-changes/event-changes.service'
import { CreateEventDto, DataEventDto, ResponseEventDto, UpdateEventDto } from '~/modules/events-module/dto/events.dto'
import { Events, EventStatus } from '~/modules/events-module/events.entity'

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Events)
    private readonly eventsRepository: Repository<Events>,
    private readonly eventChangesService: EventChangesService,
  ) {}

  async create(organizerId: string, body: CreateEventDto): Promise<ResponseEventDto> {
    this.checkDates(body.startDate, body.endDate)
    const instance = this.eventsRepository.create({ ...body, organizerId })
    const event = await this.eventsRepository.save(instance)
    return { data: plainToInstance(DataEventDto, event) }
  }

  async update(id: string, body: UpdateEventDto): Promise<ResponseEventDto> {
    await this.validateBeforeUpdate(id, body)
    await this.eventsRepository.update(id, body)
    return this.getById(id)
  }

  async getById(id: string): Promise<ResponseEventDto> {
    const event = await this.eventsRepository.findOne({ where: { id } })
    if (!event) {
      throw new NotFoundException('Event not found')
    }
    return { data: plainToInstance(DataEventDto, event) }
  }

  async delete(id: string): Promise<void> {
    const { data: event } = await this.getById(id)
    if (event.status !== EventStatus.DRAFT) {
      throw new BadRequestException('Event cannot be deleted because it is not draft')
    }
    await this.eventsRepository.delete(id)
  }

  async cancel(id: string): Promise<void> {
    const { data: event } = await this.getById(id)
    if (event.status === EventStatus.PUBLISHED || event.status === EventStatus.GOING) {
      await this.eventsRepository.update(id, { status: EventStatus.CANCELED })
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
      //throw new BadRequestException('Start date must be after today')
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

  private async dealWithRelevantChanges(data: DataEventDto, body: UpdateEventDto): Promise<void> {
    const addressFields = ['cityId', 'zipCode', 'neighborhood', 'street', 'number', 'complement']

    const relevantFields = new Set(['title', 'startDate', 'endDate', 'maxParticipants', ...addressFields])

    const relevantChangedFields = Object.keys(body).filter((key) => {
      if (!relevantFields.has(key)) return false
      const previous = data[key as keyof DataEventDto]
      const next = body[key as keyof UpdateEventDto]
      return this.serializeComparableFieldValue(previous) !== this.serializeComparableFieldValue(next)
    })

    if (relevantChangedFields.length === 0) return

    const oldValue = Object.fromEntries(relevantChangedFields.map((f) => [f, data[f as keyof DataEventDto]]))
    const newValue = Object.fromEntries(relevantChangedFields.map((f) => [f, body[f as keyof UpdateEventDto]]))

    await this.eventChangesService.create(data.organizerId, data.id, {
      changedFields: relevantChangedFields,
      oldValue,
      newValue,
    })

    // TODO: deal with relevant changes (refund, send email, notification, etc.)
  }

  private async validateBeforeUpdate(id: string, body: UpdateEventDto): Promise<void> {
    if (body.startDate && body.endDate) {
      this.checkDates(body.startDate, body.endDate)
    }

    const statusToBlock = [EventStatus.GOING, EventStatus.FINISHED, EventStatus.CANCELED]
    const { data: event } = await this.getById(id)

    if (new Date() > event.startDate && statusToBlock.includes(event.status)) {
      const statusMessage = event.status === EventStatus.GOING ? 'started' : event.status
      throw new BadRequestException(`Event cannot be updated because it has already ${statusMessage}`)
    }

    if (event.status === EventStatus.PUBLISHED && body.status === EventStatus.DRAFT) {
      throw new BadRequestException('Event cannot be updated to draft because it is published')
    }

    if (event.status === EventStatus.PUBLISHED) {
      await this.dealWithRelevantChanges(event, body)
    }
  }
}
