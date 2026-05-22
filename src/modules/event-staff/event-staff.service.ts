import { Injectable, NotFoundException } from '@nestjs/common'
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

@Injectable()
export class EventStaffService {
  constructor(
    @InjectRepository(EventStaff)
    private eventStaffRepository: Repository<EventStaff>,
  ) {}

  async create(body: CreateEventStaff): Promise<EventStaffResponseDto> {
    const eventStaff = this.eventStaffRepository.create(body)
    const data = await this.eventStaffRepository.save(eventStaff)

    return { data: plainToInstance(EventStaffDataDto, data) }
  }

  async updateAccessLevel(staffId: string, accessLevel: EventStaffAccessLevel): Promise<EventStaffResponseDto> {
    const updated = await this.eventStaffRepository.update(staffId, { accessLevel })
    if (updated.affected === 0) {
      throw new NotFoundException('Event staff not found')
    }

    return this.getById(staffId)
  }

  async getByEventId(eventId: string, queryParams: QueryEventStaffDto): Promise<PaginateEventStaffDto> {
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

  async getById(id: string): Promise<EventStaffResponseDto> {
    const data = await this.buildBaseQuery().where('es.id = :id', { id }).getOne()
    if (!data) {
      throw new NotFoundException('Event staff not found')
    }
    return { data: plainToInstance(EventStaffDataDto, data) }
  }

  async deleteStaff(staffId: string): Promise<void> {
    const deleted = await this.eventStaffRepository.delete(staffId)
    if (deleted.affected === 0) {
      throw new NotFoundException('Event staff not found')
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
