import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
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
  PaginateEventStaffInvitationsWithOrganizerDto,
  QueryUserInvitationsDto,
} from '~/modules/event-staff-invitations/dto/event-staff.invitations.dto'
import { EventStaffInvitationsService } from '~/modules/event-staff-invitations/event-staff.invitations.service'
import { EventStaffResponseDto } from '~/modules/event-staff/dto/event-staff.dto'

@ApiTags('Users - Events Staff Invitations')
@UseGuards(AuthGuard('jwt'))
@Controller('invitations')
export class UserInvitationsController {
  constructor(private readonly eventStaffInvitationsService: EventStaffInvitationsService) {}

  @Post(':invitationId/accept')
  @ApiOperation({ summary: 'Accept an invitation' })
  @ApiParam({ name: 'invitationId', type: String, description: 'The ID of the invitation' })
  @ApiOkResponse({
    type: EventStaffResponseDto,
    description: 'The invitation has been accepted.',
  })
  @ApiBadRequestResponse({ description: 'Can only accept invitation to opened event' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'This invitation is not for you' })
  @ApiNotFoundResponse({ description: 'Event staff invitation not found. Event not found' })
  async acceptInvitation(
    @Req() req: AuthenticatedRequest,
    @Param('invitationId') invitationId: string,
  ): Promise<EventStaffResponseDto> {
    return this.eventStaffInvitationsService.acceptInvitation(req.user.id, invitationId)
  }

  @Post(':invitationId/reject')
  @ApiOperation({ summary: 'Reject an invitation' })
  @ApiParam({ name: 'invitationId', type: String, description: 'The ID of the invitation' })
  @ApiOkResponse({
    type: MessageDto,
    description: 'The invitation has been rejected.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'This invitation is not for you' })
  @ApiNotFoundResponse({ description: 'Event staff invitation not found' })
  async rejectInvitation(
    @Req() req: AuthenticatedRequest,
    @Param('invitationId') invitationId: string,
  ): Promise<MessageDto> {
    return this.eventStaffInvitationsService.rejectInvitation(req.user.id, invitationId)
  }

  @Get('me')
  @ApiOperation({ summary: 'Get all invitations for the current user' })
  @ApiOkResponse({
    type: PaginateEventStaffInvitationsWithOrganizerDto,
    description: 'The list of invitations for the current user.',
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters. Page number is out of range.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getByUserId(
    @Req() req: AuthenticatedRequest,
    @Query() query: QueryUserInvitationsDto,
  ): Promise<PaginateEventStaffInvitationsWithOrganizerDto> {
    return this.eventStaffInvitationsService.getByUserId(req.user.id, query)
  }
}
