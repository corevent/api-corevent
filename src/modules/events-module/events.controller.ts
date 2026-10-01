import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import {
  CreateEventDto,
  EventResponseDto,
  OrganizerQueryEventsDto,
  PaginateEventsDto,
  QueryEventsDto,
  UpdateEventDto,
} from '~/modules/events-module/dto/events.dto'
import { EventsService } from '~/modules/events-module/events.service'
import { ConfirmImageUploadDto } from '~/modules/storage/dto/storage.dto'

@ApiTags('Events')
@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an event' })
  @ApiBody({ type: CreateEventDto })
  @ApiCreatedResponse({ type: EventResponseDto, description: 'The event has been successfully created.' })
  @ApiBadRequestResponse({
    description: [
      'Start date must be after today.',
      'Start date must be before end date.',
      'Address fields are required for in-person events.',
    ].join(' '),
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(@Req() req: AuthenticatedRequest, @Body() body: CreateEventDto): Promise<EventResponseDto> {
    return this.eventsService.create(req.user.id, body)
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an event by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the event' })
  @ApiOkResponse({ description: 'The event has been successfully cancelled.' })
  @ApiBadRequestResponse({
    description: [
      'You are not the organizer of this event.',
      'Event cannot be cancelled because it is draft, delete instead.',
      'Event cannot be cancelled because it is finished.',
      'Event already cancelled.',
    ].join(' '),
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async cancel(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    return this.eventsService.cancel(req.user.id, id)
  }

  @Patch(':id/banner')
  @ApiOperation({ summary: 'Confirm event banner upload and save the image URL' })
  @ApiParam({ name: 'id', description: 'The ID of the event' })
  @ApiBody({ type: ConfirmImageUploadDto })
  @ApiOkResponse({ type: EventResponseDto, description: 'The event banner has been saved.' })
  @ApiBadRequestResponse({
    description: [
      'Invalid event banner upload key.',
      'Uploaded image not found in storage.',
      'You are not the organizer of this event.',
    ].join(' '),
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async updateBanner(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: ConfirmImageUploadDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.updateBanner(req.user.id, id, body.key)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiParam({ name: 'id', description: 'The ID of the event' })
  @ApiBody({ type: UpdateEventDto })
  @ApiOkResponse({ type: EventResponseDto, description: 'The event has been successfully updated.' })
  @ApiBadRequestResponse({
    description: [
      'You are not the organizer of this event.',
      'Start date must be after today.',
      'Start date must be before end date.',
      'Event cannot be updated because it has already started.',
      'Event cannot be updated to draft because it is published.',
      'Online events cannot be updated to physical address.',
      'Address fields are required for in-person events.',
    ].join(' '),
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.update(req.user.id, id, body)
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiOkResponse({ type: PaginateEventsDto, description: 'The events have been successfully retrieved.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters. Page number is out of range.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAll(@Query() query: QueryEventsDto): Promise<PaginateEventsDto> {
    return this.eventsService.getAll(query)
  }

  @Get('my/organizer')
  @ApiOperation({ summary: 'Get the events of the current user' })
  @ApiOkResponse({ type: PaginateEventsDto, description: 'The events organized by the current user.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters. Page number is out of range.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getEvents(
    @Req() req: AuthenticatedRequest,
    @Query() query: OrganizerQueryEventsDto,
  ): Promise<PaginateEventsDto> {
    return this.eventsService.getAll(query, req.user.id, 'organizer')
  }

  @Get('my/staff')
  @ApiOperation({ summary: 'Get the events where the current user is a staff' })
  @ApiOkResponse({ type: PaginateEventsDto, description: 'The events where the current user is a staff.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters. Page number is out of range.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getStaffEvents(@Req() req: AuthenticatedRequest, @Query() query: QueryEventsDto): Promise<PaginateEventsDto> {
    return this.eventsService.getAll(query, req.user.id, 'staff')
  }

  @Get('my/favorites')
  @ApiOperation({ summary: 'Get the events that the current user has favorited' })
  @ApiOkResponse({ type: PaginateEventsDto, description: 'The events that the current user has favorited.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters. Page number is out of range.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getFavorites(@Req() req: AuthenticatedRequest, @Query() query: QueryEventsDto): Promise<PaginateEventsDto> {
    return this.eventsService.getAll(query, req.user.id, 'favorite')
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the event' })
  @ApiOkResponse({ type: EventResponseDto, description: 'The event has been successfully retrieved.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async getById(@Param('id') id: string): Promise<EventResponseDto> {
    return this.eventsService.getById(id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the event' })
  @ApiOkResponse({ description: 'The event has been successfully deleted.' })
  @ApiBadRequestResponse({
    description: 'You are not the organizer of this event. Event cannot be deleted because it is not draft.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    return this.eventsService.delete(req.user.id, id)
  }
}
