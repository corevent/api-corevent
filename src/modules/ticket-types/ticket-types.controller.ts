import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import {
  CreateTicketTypeDto,
  PaginatedTicketTypesListDto,
  QueryTicketTypesDto,
  TicketTypeResponseDto,
  UpdateTicketTypeDto,
} from '~/modules/ticket-types/dto/ticket-types.dto'
import { TicketTypesService } from '~/modules/ticket-types/ticket-types.service'

@ApiTags('Events - Ticket Types')
@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  @Post(':eventId/ticket-types')
  @ApiOperation({ summary: 'Create a new ticket type' })
  @ApiBody({ type: CreateTicketTypeDto })
  @ApiCreatedResponse({
    description: 'The ticket type has been successfully created',
    type: TicketTypeResponseDto,
  })
  @ApiBadRequestResponse({
    description: [
      'Event capacity is not enough for the ticket types.',
      'Start date must be before end date.',
      'Ticket type dates must be within the event dates.',
      'Cannot create because event is not draft.',
      'You are not the organizer of this event.',
    ].join(' '),
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Body() body: CreateTicketTypeDto,
  ): Promise<TicketTypeResponseDto> {
    return this.ticketTypesService.create(req.user.id, eventId, body)
  }

  @Patch('ticket-types/:ticketTypeId')
  @ApiOperation({ summary: 'Update a ticket type' })
  @ApiParam({ name: 'ticketTypeId', description: 'The ID of the ticket type to update' })
  @ApiBody({ type: UpdateTicketTypeDto })
  @ApiOkResponse({
    description: 'The ticket type has been successfully updated',
    type: TicketTypeResponseDto,
  })
  @ApiBadRequestResponse({
    description: [
      'Event capacity is not enough for the ticket types.',
      'Start date must be before end date.',
      'Ticket type dates must be within the event dates.',
      'Cannot update because event is not draft.',
      'You are not the organizer of this event.',
    ].join(' '),
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Ticket type not found. Event not found' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('ticketTypeId') ticketTypeId: string,
    @Body() body: UpdateTicketTypeDto,
  ): Promise<TicketTypeResponseDto> {
    return this.ticketTypesService.update(req.user.id, ticketTypeId, body)
  }

  @Get(':eventId/ticket-types')
  @ApiOperation({ summary: 'Get all ticket types' })
  @ApiParam({ name: 'eventId', description: 'The ID of the event' })
  @ApiOkResponse({
    description: 'The ticket types have been successfully retrieved',
    type: PaginatedTicketTypesListDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters. Page number is out of range.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAll(
    @Param('eventId') eventId: string,
    @Query() query: QueryTicketTypesDto,
  ): Promise<PaginatedTicketTypesListDto> {
    return this.ticketTypesService.getAll(eventId, query)
  }

  @Get('ticket-types/:ticketTypeId')
  @ApiOperation({ summary: 'Get a ticket type by ID' })
  @ApiParam({ name: 'ticketTypeId', description: 'The ID of the ticket type to get' })
  @ApiOkResponse({
    description: 'The ticket type has been successfully retrieved',
    type: TicketTypeResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Ticket type not found' })
  async getById(@Param('ticketTypeId') ticketTypeId: string): Promise<TicketTypeResponseDto> {
    return this.ticketTypesService.getById(ticketTypeId)
  }

  @Delete('ticket-types/:ticketTypeId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a ticket type' })
  @ApiParam({ name: 'ticketTypeId', description: 'The ID of the ticket type to delete' })
  @ApiNoContentResponse({ description: 'The ticket type has been successfully deleted' })
  @ApiBadRequestResponse({
    description: 'Cannot delete because event is not draft. You are not the organizer of this event.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Ticket type not found. Event not found' })
  async delete(@Req() req: AuthenticatedRequest, @Param('ticketTypeId') ticketTypeId: string): Promise<void> {
    return this.ticketTypesService.delete(req.user.id, ticketTypeId)
  }
}
