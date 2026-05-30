import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { MessageDto } from '~/common/dto/message.dto'
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
  @ApiResponse({ status: 200, type: MessageDto, description: 'The access level has been updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Staff not found' })
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
  @ApiQuery({ type: QueryEventStaffDto })
  @ApiResponse({ status: 200, type: PaginateEventStaffDto, description: 'The list of staff for the event.' })
  async getAll(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Query() query: QueryEventStaffDto,
  ): Promise<PaginateEventStaffDto> {
    return this.eventStaffService.getByEventId(req.user.id, eventId, query)
  }

  @Get('staff/:staffId')
  @ApiOperation({ summary: 'Get a staff by ID' })
  @ApiParam({ name: 'staffId' })
  @ApiResponse({ status: 200, type: EventStaffResponseDto })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  async getById(@Req() req: AuthenticatedRequest, @Param('staffId') staffId: string): Promise<EventStaffResponseDto> {
    return this.eventStaffService.getById(req.user.id, staffId)
  }

  @Delete('staff/:staffId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a staff by ID' })
  @ApiParam({ name: 'staffId' })
  @ApiResponse({ status: 204, description: 'The staff has been deleted successfully' })
  @ApiResponse({ status: 404, description: 'Staff not found' })
  async deleteStaff(@Req() req: AuthenticatedRequest, @Param('staffId') staffId: string): Promise<void> {
    return this.eventStaffService.deleteStaff(req.user.id, staffId)
  }
}
