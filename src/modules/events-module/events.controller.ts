import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import {
  CreateEventDto,
  EventResponseDto,
  PaginateEventsDto,
  QueryEventsDto,
  UpdateEventDto,
} from '~/modules/events-module/dto/events.dto'
import { EventsService } from '~/modules/events-module/events.service'

@ApiTags('Events')
@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an event' })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({ status: 201, type: EventResponseDto, description: 'The event has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Req() req: AuthenticatedRequest, @Body() body: CreateEventDto): Promise<EventResponseDto> {
    return this.eventsService.create(req.user.id, body)
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an event by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the event' })
  @ApiResponse({ status: 200, description: 'The event has been successfully cancelled.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  async cancel(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    return this.eventsService.cancel(req.user.id, id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiParam({ name: 'id', description: 'The ID of the event' })
  @ApiBody({ type: UpdateEventDto })
  @ApiResponse({ status: 200, type: EventResponseDto, description: 'The event has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.update(req.user.id, id, body)
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({ type: QueryEventsDto })
  @ApiResponse({ status: 200, type: PaginateEventsDto, description: 'The events have been successfully retrieved.' })
  async getAll(@Query() query: QueryEventsDto): Promise<PaginateEventsDto> {
    return this.eventsService.getAll(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the event' })
  @ApiResponse({ status: 200, type: EventResponseDto, description: 'The event has been successfully retrieved.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  async getById(@Param('id') id: string): Promise<EventResponseDto> {
    return this.eventsService.getById(id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the event' })
  @ApiResponse({ status: 200, description: 'The event has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Event not found.' })
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    return this.eventsService.delete(req.user.id, id)
  }
}
