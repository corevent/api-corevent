import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { createPaginationMeta } from '~/common/pagination/pagination-meta.factory'
import { getOffset } from '~/common/utils/get-offset.util'
import { EventStaffAccessLevel } from '~/modules/event-staff-invitations/event-staff-invitations.entity'
import {
  EventStaffDataDto,
  EventStaffResponseDto,
  ListEventStaffDto,
  PaginateEventStaffDto,
  QueryEventStaffDto,
} from '~/modules/event-staff/dto/event-staff.dto'
import { EventStaff } from '~/modules/event-staff/event-staff.entity'
import { CreateEventStaff } from '~/modules/event-staff/interfaces/event-staff.interface'
import { EventsService } from '~/modules/events-module/events.service'

@Injectable()
export class EventStaffService {
  constructor(
    @InjectRepository(EventStaff)
    private eventStaffRepository: Repository<EventStaff>,
    private eventsService: EventsService,
  ) {}

  async create(body: CreateEventStaff): Promise<EventStaffResponseDto> {
    const eventStaff = this.eventStaffRepository.create(body)
    const data = await this.eventStaffRepository.save(eventStaff)

    return { data: plainToInstance(EventStaffDataDto, data) }
  }

  async updateAccessLevel(
    userId: string,
    staffId: string,
    accessLevel: EventStaffAccessLevel,
  ): Promise<EventStaffResponseDto> {
    const staff = await this.eventStaffRepository.findOne({ where: { id: staffId }, select: ['eventId', 'id'] })
    if (!staff) {
      throw new NotFoundException('Event staff not found')
    }
    await this.validateOrganizer(userId, staff.eventId)

    await this.eventStaffRepository.update(staffId, { accessLevel })
    return this.getById(userId, staffId)
  }

  async getByEventId(userId: string, eventId: string, queryParams: QueryEventStaffDto): Promise<PaginateEventStaffDto> {
    await this.validateOrganizer(userId, eventId)

    const { page, limit, ...filters } = queryParams
    const query = this.buildBaseQuery()
      .where('es.eventId = :eventId', { eventId })
      .limit(limit)
      .offset(getOffset(page, limit))
    this.applyFilters(query, filters)

    const [list, total] = await query.getManyAndCount()
    return {
      data: plainToInstance(ListEventStaffDto, list),
      meta: createPaginationMeta(queryParams.page, queryParams.limit, total),
    }
  }

  async getById(userId: string, id: string): Promise<EventStaffResponseDto> {
    const data = await this.buildBaseQuery().where('es.id = :id', { id }).getOne()
    if (!data) {
      throw new NotFoundException('Event staff not found')
    }
    await this.validateOrganizer(userId, data.eventId)
    return { data: plainToInstance(EventStaffDataDto, data) }
  }

  async deleteStaff(userId: string, staffId: string): Promise<void> {
    const staff = await this.eventStaffRepository.findOne({ where: { id: staffId }, select: ['eventId', 'id'] })
    if (!staff) {
      throw new NotFoundException('Event staff not found')
    }
    await this.validateOrganizer(userId, staff.eventId)

    await this.eventStaffRepository.delete(staffId)
  }

  private async validateOrganizer(userId: string, eventId: string): Promise<void> {
    const { data: event } = await this.eventsService.getById(eventId)
    if (event.organizer.id !== userId) {
      throw new ForbiddenException('You are not the organizer of this event')
    }
  }

  private applyFilters(query: SelectQueryBuilder<EventStaff>, filters: Partial<QueryEventStaffDto>): void {
    const { name, email, invitationStatus, accessLevel } = filters
    if (name) {
      query.andWhere('u.name ILIKE :name', { name: `%${name}%` })
    }
    if (email) {
      query.andWhere('u.email ILIKE :email', { email: `%${email}%` })
    }
    if (invitationStatus) {
      query.andWhere('es.invitationStatus = :invitationStatus', { invitationStatus })
    }
    if (accessLevel) {
      query.andWhere('es.accessLevel = :accessLevel', { accessLevel })
    }
  }

  private buildBaseQuery(): SelectQueryBuilder<EventStaff> {
    const query = this.eventStaffRepository
      .createQueryBuilder('es')
      .select([
        'es.id',
        'es.eventId',
        'es.accessLevel',
        'es.invitationStatus',
        'es.staffInvitationId',
        'es.createdAt',
        'u.id',
        'u.name',
        'u.email',
        'u.avatarUrl',
      ])
      .innerJoin('es.user', 'u')

    return query
  }
}
