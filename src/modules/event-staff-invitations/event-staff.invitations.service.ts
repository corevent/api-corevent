import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
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
  QueryUserInvitationsDto,
} from '~/modules/event-staff-invitations/dto/event-staff.invitations.dto'
import { EventStaffInvitationStatus } from '~/modules/event-staff-invitations/enums/event-staff-invitation.enums'
import { EventStaffInvitations } from '~/modules/event-staff-invitations/event-staff-invitations.entity'
import { EventStaffResponseDto } from '~/modules/event-staff/dto/event-staff.dto'
import { EventStaffService } from '~/modules/event-staff/event-staff.service'
import { EventDataDto } from '~/modules/events-module/dto/events.dto'
import { EventStatus } from '~/modules/events-module/events.entity'
import { EventsService } from '~/modules/events-module/events.service'
import { MailService } from '~/modules/mail/mail.service'
import { UsersService } from '~/modules/users/users.service'

@Injectable()
export class EventStaffInvitationsService {
  constructor(
    @InjectRepository(EventStaffInvitations)
    private staffInvitationRepo: Repository<EventStaffInvitations>,
    private eventsService: EventsService,
    private eventStaffService: EventStaffService,
    private mailService: MailService,
    private usersService: UsersService,
  ) {}

  async create(
    organizerId: string,
    eventId: string,
    body: CreateEventStaffInvitationDto,
  ): Promise<EventStaffInvitationResponseDto> {
    const userId = await this.sendInvitationEmail(organizerId, body.email, eventId)
    const staffInvitation = this.staffInvitationRepo.create({
      ...body,
      eventId,
      userId,
      invitationStatus: EventStaffInvitationStatus.PENDING,
    })

    const data = await this.staffInvitationRepo.save(staffInvitation)
    return { data: plainToInstance(EventStaffInvitationDataDto, data) }
  }

  async acceptInvitation(userId: string, id: string): Promise<EventStaffResponseDto> {
    const { data: invitation } = await this.getById(id)
    if (invitation.userId !== userId) {
      throw new ForbiddenException('This invitation is not for you')
    }
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

  async rejectInvitation(userId: string, id: string): Promise<{ message: string }> {
    const { data: invitation } = await this.getById(id)
    if (invitation.userId !== userId) {
      throw new ForbiddenException('This invitation is not for you')
    }
    await this.staffInvitationRepo.update(id, { invitationStatus: EventStaffInvitationStatus.REJECTED })

    return { message: 'Invitation rejected successfully' }
  }

  async cancelInvitation(organizerId: string, id: string): Promise<{ message: string }> {
    const { data: invitation } = await this.getById(id)
    const { data: event } = await this.eventsService.getById(invitation.eventId)
    if (event.organizer.id !== organizerId) {
      throw new ForbiddenException('You are not the organizer of this event')
    }
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
    queryParams: QueryUserInvitationsDto,
  ): Promise<PaginateEventStaffInvitationsWithOrganizerDto> {
    const { page, limit, invitationStatus } = queryParams
    const query = this.staffInvitationRepo
      .createQueryBuilder('esi')
      .select([
        'esi.id',
        'esi.userId',
        'esi.originalAccessLevel',
        'esi.invitationStatus',
        'esi.createdAt',
        'e.id',
        'e.title',
        'o.id',
        'o.name',
        'o.email',
        'o.avatarUrl',
      ])
      .where('esi.userId = :userId', { userId })
      .innerJoin('esi.event', 'e')
      .innerJoin('e.organizer', 'o')
      .orderBy('esi.createdAt', 'DESC')
      .limit(limit)
      .offset(getOffset(page, limit))

    if (invitationStatus) {
      query.andWhere('esi.invitationStatus = :invitationStatus', { invitationStatus })
    }

    const [list, total] = await query.getManyAndCount()

    return {
      data: plainToInstance(ListEventStaffInvitationsWithOrganizerDto, list),
      meta: createPaginationMeta(page, limit, total),
    }
  }

  private validateEvent(organizerId: string, event: EventDataDto, userId: string): void {
    if (event.status !== EventStatus.OPENED) {
      throw new BadRequestException('Can only add staff to opened event')
    }

    if (event.organizer.id !== organizerId) {
      throw new ForbiddenException('You are not the organizer of this event')
    }

    if (userId === organizerId) {
      throw new BadRequestException('You cannot add yourself as staff')
    }
  }

  private buildBaseQuery(): SelectQueryBuilder<EventStaffInvitations> {
    return this.staffInvitationRepo
      .createQueryBuilder('esi')
      .select([
        'esi.id',
        'esi.userId',
        'esi.eventId',
        'esi.originalAccessLevel',
        'esi.invitationStatus',
        'u.id',
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

  private async checkIfInvitationExists(userId: string, eventId: string): Promise<void> {
    const invitation = await this.staffInvitationRepo.findOne({ where: { userId, eventId } })
    if (invitation) {
      throw new BadRequestException('Invitation already exists')
    }
  }

  private async sendInvitationEmail(organizerId: string, email: string, eventId: string): Promise<string> {
    const user = await this.usersService.findByEmail(email)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const { data: event } = await this.eventsService.getById(eventId)

    await this.checkIfInvitationExists(user.id, eventId)
    this.validateEvent(organizerId, event, user.id)

    const organizerName = event.organizer.name
    const eventName = event.title

    await this.mailService.inviteStaff(email, organizerName, eventName)

    return user.id
  }
}
