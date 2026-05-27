import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
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
  @ApiResponse({
    status: 201,
    description: 'The ticket type has been successfully created',
    type: TicketTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Event not found' })
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
  @ApiResponse({
    status: 200,
    description: 'The ticket type has been successfully updated',
    type: TicketTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Ticket type not found' })
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
  @ApiQuery({ type: QueryTicketTypesDto })
  @ApiResponse({
    status: 200,
    description: 'The ticket types have been successfully retrieved',
    type: TicketTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Ticket type not found' })
  async getAll(
    @Param('eventId') eventId: string,
    @Query() query: QueryTicketTypesDto,
  ): Promise<PaginatedTicketTypesListDto> {
    return this.ticketTypesService.getAll(eventId, query)
  }

  @Get('ticket-types/:ticketTypeId')
  @ApiOperation({ summary: 'Get a ticket type by ID' })
  @ApiParam({ name: 'ticketTypeId', description: 'The ID of the ticket type to get' })
  @ApiResponse({
    status: 200,
    description: 'The ticket type has been successfully retrieved',
    type: TicketTypeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Ticket type not found' })
  async getById(@Param('ticketTypeId') ticketTypeId: string): Promise<TicketTypeResponseDto> {
    return this.ticketTypesService.getById(ticketTypeId)
  }

  @Delete('ticket-types/:ticketTypeId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a ticket type' })
  @ApiParam({ name: 'ticketTypeId', description: 'The ID of the ticket type to delete' })
  @ApiResponse({ status: 204, description: 'The ticket type has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Ticket type not found' })
  async delete(@Req() req: AuthenticatedRequest, @Param('ticketTypeId') ticketTypeId: string): Promise<void> {
    return this.ticketTypesService.delete(req.user.id, ticketTypeId)
  }
}
