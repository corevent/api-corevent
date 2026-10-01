import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBody,
  ApiForbiddenResponse,
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
  EventStaffResponseDto,
  PaginateEventStaffDto,
  QueryEventStaffDto,
  UpdateAccessLevelDto,
} from '~/modules/event-staff/dto/event-staff.dto'
import { EventStaffService } from '~/modules/event-staff/event-staff.service'

@ApiTags('Event Staff')
@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class EventStaffController {
  constructor(private readonly eventStaffService: EventStaffService) {}

  @Patch(':staffId/access-level')
  @ApiOperation({ summary: 'Update the access level of a staff' })
  @ApiParam({ name: 'staffId', type: String, description: 'The ID of the staff' })
  @ApiBody({ type: UpdateAccessLevelDto })
  @ApiOkResponse({ type: EventStaffResponseDto, description: 'The access level has been updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You are not the organizer of this event' })
  @ApiNotFoundResponse({ description: 'Event staff not found. Event not found' })
  async updateAccessLevel(
    @Req() req: AuthenticatedRequest,
    @Param('staffId') staffId: string,
    @Body() body: UpdateAccessLevelDto,
  ): Promise<EventStaffResponseDto> {
    return this.eventStaffService.updateAccessLevel(req.user.id, staffId, body.accessLevel)
  }

  @Get(':eventId/staff')
  @ApiOperation({ summary: 'Get all staff for an event' })
  @ApiParam({ name: 'eventId', type: String, description: 'The ID of the event' })
  @ApiOkResponse({ type: PaginateEventStaffDto, description: 'The list of staff for the event.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You are not the organizer of this event' })
  @ApiNotFoundResponse({ description: 'Event not found' })
  async getAll(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Query() query: QueryEventStaffDto,
  ): Promise<PaginateEventStaffDto> {
    return this.eventStaffService.getByEventId(req.user.id, eventId, query)
  }

  @Get('staff/:staffId')
  @ApiOperation({ summary: 'Get a staff by ID' })
  @ApiParam({ name: 'staffId', type: String, description: 'The ID of the staff' })
  @ApiOkResponse({ type: EventStaffResponseDto, description: 'The staff member.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You are not the organizer of this event' })
  @ApiNotFoundResponse({ description: 'Event staff not found. Event not found' })
  async getById(@Req() req: AuthenticatedRequest, @Param('staffId') staffId: string): Promise<EventStaffResponseDto> {
    return this.eventStaffService.getById(req.user.id, staffId)
  }

  @Delete('staff/:staffId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a staff by ID' })
  @ApiParam({ name: 'staffId', type: String, description: 'The ID of the staff' })
  @ApiNoContentResponse({ description: 'The staff has been deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You are not the organizer of this event' })
  @ApiNotFoundResponse({ description: 'Event staff not found. Event not found' })
  async deleteStaff(@Req() req: AuthenticatedRequest, @Param('staffId') staffId: string): Promise<void> {
    return this.eventStaffService.deleteStaff(req.user.id, staffId)
  }
}
