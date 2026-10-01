import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { MessageDto } from '~/common/dto/message.dto'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import {
  CreateEventStaffInvitationDto,
  EventStaffInvitationResponseDto,
  PaginateEventStaffInvitationsDto,
  QueryEventStaffInvitationsDto,
} from '~/modules/event-staff-invitations/dto/event-staff.invitations.dto'
import { EventStaffInvitationsService } from '~/modules/event-staff-invitations/event-staff.invitations.service'

@ApiTags('Events (Organizers) - Events Staff Invitations')
@UseGuards(AuthGuard('jwt'))
@Controller('invitations')
export class StaffInvitesController {
  constructor(private readonly eventStaffInvitationsService: EventStaffInvitationsService) {}

  @Post('events/:eventId')
  @ApiOperation({ summary: 'Invite a user to be a staff for an event' })
  @ApiBody({ type: CreateEventStaffInvitationDto })
  @ApiCreatedResponse({
    type: EventStaffInvitationResponseDto,
    description: 'The staff has been successfully invited.',
  })
  @ApiBadRequestResponse({
    description: 'Can only add staff to opened event. You cannot add yourself as staff. Invitation already exists.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You are not the organizer of this event' })
  @ApiNotFoundResponse({ description: 'User not found. Event not found' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Body() body: CreateEventStaffInvitationDto,
  ): Promise<EventStaffInvitationResponseDto> {
    return this.eventStaffInvitationsService.create(req.user.id, eventId, body)
  }

  @Post(':invitationId/cancel')
  @ApiOperation({ summary: 'Cancel an invitation' })
  @ApiParam({ name: 'invitationId', type: String, description: 'The ID of the invitation' })
  @ApiOkResponse({
    type: MessageDto,
    description: 'The invitation has been canceled.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You are not the organizer of this event' })
  @ApiNotFoundResponse({ description: 'Event staff invitation not found. Event not found' })
  async cancelInvitation(
    @Req() req: AuthenticatedRequest,
    @Param('invitationId') invitationId: string,
  ): Promise<MessageDto> {
    return this.eventStaffInvitationsService.cancelInvitation(req.user.id, invitationId)
  }

  @Get('events/:eventId')
  @ApiOperation({ summary: 'Get all invitations for an event' })
  @ApiParam({ name: 'eventId', type: String, description: 'The ID of the event' })
  @ApiOkResponse({
    type: PaginateEventStaffInvitationsDto,
    description: 'The list of invitations for the event.',
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters. Page number is out of range.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAll(
    @Param('eventId') eventId: string,
    @Query() query: QueryEventStaffInvitationsDto,
  ): Promise<PaginateEventStaffInvitationsDto> {
    return this.eventStaffInvitationsService.getAll(eventId, query)
  }
}
