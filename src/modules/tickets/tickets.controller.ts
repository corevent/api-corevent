import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
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
  @ApiOkResponse({ type: CheckinResponseDto, description: 'The ticket has been checked in.' })
  @ApiBadRequestResponse({
    description: 'Ticket does not belong to this event. Ticket is cancelled. Order is not paid.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You do not have permission to check in tickets for this event' })
  @ApiNotFoundResponse({ description: 'Invalid QR code. Event not found' })
  @ApiConflictResponse({ description: 'Ticket already checked in' })
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
  @ApiOkResponse({ type: PaginateEventParticipantsDto, description: 'The list of event participants.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters. Page number is out of range.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You do not have permission to access this event' })
  @ApiNotFoundResponse({ description: 'Event not found' })
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
  @ApiOkResponse({ type: EventParticipantDetailsResponseDto, description: 'The participant ticket details.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You do not have permission to access this event' })
  @ApiNotFoundResponse({ description: 'Participant not found. Event not found' })
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
  @ApiOkResponse({ type: MyTicketsResponseDto, description: 'The tickets of the current user for this event.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getMyTicketsByEvent(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
  ): Promise<MyTicketsResponseDto> {
    return this.ticketsService.getMyTicketsByEvent(req.user.id, eventId)
  }
}
