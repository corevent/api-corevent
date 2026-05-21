import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { MessageDto } from '~/common/dto/message.dto'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import {
  PaginateEventStaffInvitationsWithOrganizerDto,
  QueryEventStaffInvitationsDto,
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
  @ApiResponse({
    status: 200,
    type: EventStaffResponseDto,
    description: 'The invitation has been accepted.',
  })
  async acceptInvitation(@Param('invitationId') invitationId: string): Promise<EventStaffResponseDto> {
    return this.eventStaffInvitationsService.acceptInvitation(invitationId)
  }

  @Post(':invitationId/reject')
  @ApiOperation({ summary: 'Reject an invitation' })
  @ApiParam({ name: 'invitationId', type: String, description: 'The ID of the invitation' })
  @ApiResponse({
    status: 200,
    type: MessageDto,
    description: 'The invitation has been rejected.',
  })
  async rejectInvitation(@Param('invitationId') invitationId: string): Promise<MessageDto> {
    return this.eventStaffInvitationsService.rejectInvitation(invitationId)
  }

  @Get('me')
  @ApiOperation({ summary: 'Get all invitations for the current user' })
  @ApiQuery({ type: QueryEventStaffInvitationsDto })
  @ApiResponse({
    status: 200,
    type: PaginateEventStaffInvitationsWithOrganizerDto,
    description: 'The list of invitations for the current user.',
  })
  async getByUserId(
    @Req() req: AuthenticatedRequest,
    @Query() query: QueryEventStaffInvitationsDto,
  ): Promise<PaginateEventStaffInvitationsWithOrganizerDto> {
    return this.eventStaffInvitationsService.getByUserId(req.user.id, query)
  }
}
