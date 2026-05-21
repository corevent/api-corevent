import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { MessageDto } from '~/common/dto/message.dto'
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
  @ApiResponse({
    status: 201,
    type: EventStaffInvitationResponseDto,
    description: 'The staff has been successfully invited.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(
    @Param('eventId') eventId: string,
    @Body() body: CreateEventStaffInvitationDto,
  ): Promise<EventStaffInvitationResponseDto> {
    return this.eventStaffInvitationsService.create(eventId, body)
  }

  @Post(':invitationId/cancel')
  @ApiOperation({ summary: 'Cancel an invitation' })
  @ApiParam({ name: 'invitationId', type: String, description: 'The ID of the invitation' })
  @ApiResponse({
    status: 200,
    type: MessageDto,
    description: 'The invitation has been canceled.',
  })
  async cancelInvitation(@Param('invitationId') invitationId: string): Promise<MessageDto> {
    return this.eventStaffInvitationsService.cancelInvitation(invitationId)
  }

  @Get('events/:eventId')
  @ApiOperation({ summary: 'Get all invitations for an event' })
  @ApiParam({ name: 'eventId', type: String, description: 'The ID of the event' })
  @ApiQuery({ type: QueryEventStaffInvitationsDto })
  @ApiResponse({
    status: 200,
    type: PaginateEventStaffInvitationsDto,
    description: 'The list of invitations for the event.',
  })
  async getAll(
    @Param('eventId') eventId: string,
    @Query() query: QueryEventStaffInvitationsDto,
  ): Promise<PaginateEventStaffInvitationsDto> {
    return this.eventStaffInvitationsService.getAll(eventId, query)
  }
}
