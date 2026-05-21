import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { createPaginationMeta } from '~/common/pagination/pagination-meta.factory'
import { QueryPaginationDto } from '~/common/pagination/pagination.dto'
import { getOffset } from '~/common/utils/get-offset.util'
import {
  CreateEventStaffInvitationDto,
  EventStaffInvitationDataDto,
  EventStaffInvitationResponseDto,
  ListEventStaffInvitationsDto,
  ListEventStaffInvitationsWithOrganizerDto,
  PaginateEventStaffInvitationsDto,
  PaginateEventStaffInvitationsWithOrganizerDto,
  QueryEventStaffInvitationsDto,
} from '~/modules/event-staff-invitations/dto/event-staff.invitations.dto'
import {
  EventStaffInvitations,
  EventStaffInvitationStatus,
} from '~/modules/event-staff-invitations/event-staff-invitations.entity'
import { EventStaffResponseDto } from '~/modules/event-staff/dto/event-staff.dto'
import { EventStaffService } from '~/modules/event-staff/event-staff.service'
import { EventStatus } from '~/modules/events-module/events.entity'
import { EventsService } from '~/modules/events-module/events.service'

@Injectable()
export class EventStaffInvitationsService {
  constructor(
    @InjectRepository(EventStaffInvitations)
    private staffInvitationRepo: Repository<EventStaffInvitations>,
    private eventsService: EventsService,
    private eventStaffService: EventStaffService,
  ) {}

  async create(eventId: string, body: CreateEventStaffInvitationDto): Promise<EventStaffInvitationResponseDto> {
    await this.validateEvent(eventId, body.userId)
    const staffInvitation = this.staffInvitationRepo.create({
      ...body,
      eventId,
      invitationStatus: EventStaffInvitationStatus.PENDING,
    })
    const data = await this.staffInvitationRepo.save(staffInvitation)
    return { data: plainToInstance(EventStaffInvitationDataDto, data) }
  }

  async acceptInvitation(id: string): Promise<EventStaffResponseDto> {
    const { data: invitation } = await this.getById(id)
    await this.validateBeforeAccept(invitation.eventId)

    await this.staffInvitationRepo.update(id, {
      invitationStatus: EventStaffInvitationStatus.ACCEPTED,
    })

    return this.eventStaffService.create({
      userId: invitation.userId,
      accessLevel: invitation.originalAccessLevel,
      eventId: invitation.eventId,
      staffInvitationId: id,
    })
  }

  async rejectInvitation(id: string): Promise<{ message: string }> {
    await this.getById(id)
    await this.staffInvitationRepo.update(id, { invitationStatus: EventStaffInvitationStatus.REJECTED })

    return { message: 'Invitation rejected successfully' }
  }

  async cancelInvitation(id: string): Promise<{ message: string }> {
    await this.getById(id)
    await this.staffInvitationRepo.update(id, { invitationStatus: EventStaffInvitationStatus.CANCELED })
    return { message: 'Invitation canceled successfully' }
  }

  // organizer list all invitations for his events
  async getAll(eventId: string, queryParams: QueryEventStaffInvitationsDto): Promise<PaginateEventStaffInvitationsDto> {
    const { page, limit, ...filters } = queryParams
    const query = this.buildBaseQuery()
      .where('esi.eventId = :eventId', { eventId })
      .limit(limit)
      .offset(getOffset(page, limit))
      .orderBy('esi.createdAt', 'DESC')
    this.applyFilters(query, filters)

    const [list, total] = await query.getManyAndCount()
    return {
      data: plainToInstance(ListEventStaffInvitationsDto, list),
      meta: createPaginationMeta(page, limit, total),
    }
  }

  // user list all invitations for him
  async getByUserId(
    userId: string,
    queryParams: QueryPaginationDto,
  ): Promise<PaginateEventStaffInvitationsWithOrganizerDto> {
    const { page, limit } = queryParams
    const [list, total] = await this.staffInvitationRepo
      .createQueryBuilder('esi')
      .select([
        'esi.id',
        'esi.userId',
        'esi.originalAccessLevel',
        'esi.invitationStatus',
        'esi.createdAt',
        'e.id',
        'e.name',
        'o.id',
        'o.name',
        'o.email',
        'o.avatarUrl',
      ])
      .where('esi.userId = :userId', { userId })
      .andWhere('esi.invitationStatus = :invitationStatus', { invitationStatus: EventStaffInvitationStatus.PENDING })
      .innerJoin('esi.event', 'e')
      .innerJoin('e.organizer', 'o')
      .orderBy('esi.createdAt', 'DESC')
      .limit(limit)
      .offset(getOffset(page, limit))
      .getManyAndCount()

    return {
      data: plainToInstance(ListEventStaffInvitationsWithOrganizerDto, list),
      meta: createPaginationMeta(page, limit, total),
    }
  }

  private async validateEvent(organizerId: string, eventId: string, userId?: string): Promise<void> {
    const { data: event } = await this.eventsService.getById(eventId)
    if (event.status !== EventStatus.OPENED) {
      throw new BadRequestException('Can only add staff to opened event')
    }

    if (event.organizerId !== organizerId) {
      throw new BadRequestException('You are not the organizer of this event')
    }

    if (userId && userId === organizerId) {
      throw new BadRequestException('You cannot add yourself as staff')
    }
  }

  private buildBaseQuery(): SelectQueryBuilder<EventStaffInvitations> {
    return this.staffInvitationRepo
      .createQueryBuilder('esi')
      .select([
        'esi.id',
        'esi.userId',
        'esi.originalAccessLevel',
        'esi.invitationStatus',
        'u.name',
        'u.email',
        'u.avatarUrl',
      ])
      .innerJoin('esi.user', 'u')
  }

  private applyFilters(
    query: SelectQueryBuilder<EventStaffInvitations>,
    filters: Partial<QueryEventStaffInvitationsDto>,
  ): void {
    const { name, email, invitationStatus, originalAccessLevel } = filters
    if (name) {
      query.andWhere('u.name ILIKE :name', { name: `%${name}%` })
    }
    if (email) {
      query.andWhere('u.email ILIKE :email', { email: `%${email}%` })
    }
    if (invitationStatus) {
      query.andWhere('esi.invitationStatus = :invitationStatus', { invitationStatus })
    }
    if (originalAccessLevel) {
      query.andWhere('esi.originalAccessLevel = :originalAccessLevel', { originalAccessLevel })
    }
  }

  private async getById(id: string): Promise<EventStaffInvitationResponseDto> {
    const data = await this.buildBaseQuery().where('esi.id = :id', { id }).getOne()

    if (!data) {
      throw new NotFoundException('Event staff invitation not found')
    }

    return { data: plainToInstance(EventStaffInvitationDataDto, data) }
  }

  private async validateBeforeAccept(eventId: string): Promise<void> {
    const { data: event } = await this.eventsService.getById(eventId)
    if (event.status !== EventStatus.OPENED) {
      throw new BadRequestException('Can only accept invitation to opened event')
    }
  }
}
