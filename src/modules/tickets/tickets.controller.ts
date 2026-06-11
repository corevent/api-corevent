import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import {
  CheckinDto,
  CheckinResponseDto,
  EventParticipantDetailsResponseDto,
  MyTicketsResponseDto,
  PaginateEventParticipantsDto,
  QueryEventParticipantsDto,
} from '~/modules/tickets/dto/tickets.dto'
import { TicketsService } from '~/modules/tickets/tickets.service'

@ApiTags('Events - Tickets')
@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post(':eventId/checkin')
  @ApiOperation({ summary: 'Check in a ticket by QR code' })
  @ApiParam({ name: 'eventId', type: String, description: 'The ID of the event' })
  @ApiBody({ type: CheckinDto })
  @ApiResponse({ status: 200, type: CheckinResponseDto })
  async checkin(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Body() body: CheckinDto,
  ): Promise<CheckinResponseDto> {
    return this.ticketsService.checkin(req.user.id, eventId, body.qrToken)
  }

  @Get(':eventId/participants')
  @ApiOperation({ summary: 'List event participants with ticket count' })
  @ApiParam({ name: 'eventId', type: String, description: 'The ID of the event' })
  @ApiQuery({ type: QueryEventParticipantsDto })
  @ApiResponse({ status: 200, type: PaginateEventParticipantsDto })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getEventParticipants(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Query() query: QueryEventParticipantsDto,
  ): Promise<PaginateEventParticipantsDto> {
    return this.ticketsService.getEventParticipants(req.user.id, eventId, query)
  }

  @Get(':eventId/participants/:userId/details')
  @ApiOperation({ summary: 'Get participant ticket details for an event' })
  @ApiParam({ name: 'eventId', type: String, description: 'The ID of the event' })
  @ApiParam({ name: 'userId', type: String, description: 'The ID of the participant user' })
  @ApiResponse({ status: 200, type: EventParticipantDetailsResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Participant not found.' })
  async getEventParticipantDetails(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
  ): Promise<EventParticipantDetailsResponseDto> {
    return this.ticketsService.getEventParticipantDetails(req.user.id, eventId, userId)
  }

  @Get(':eventId/my/tickets')
  @ApiOperation({ summary: 'Get my tickets for an event' })
  @ApiParam({ name: 'eventId', type: String, description: 'The ID of the event' })
  @ApiResponse({ status: 200, type: MyTicketsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyTicketsByEvent(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
  ): Promise<MyTicketsResponseDto> {
    return this.ticketsService.getMyTicketsByEvent(req.user.id, eventId)
  }
}
