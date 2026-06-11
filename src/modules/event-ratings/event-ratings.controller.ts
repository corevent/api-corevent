import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import {
  CreateEventRatingDto,
  EventRatingResponseDto,
  PaginateMyEventRatingsDto,
  QueryMyEventRatingsDto,
} from '~/modules/event-ratings/dto/event-ratings.dto'
import { EventRatingsService } from '~/modules/event-ratings/event-ratings.service'

@ApiTags('Event - Ratings')
@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class EventRatingsController {
  constructor(private readonly eventRatingsService: EventRatingsService) {}

  @Get('my/ratings')
  @ApiOperation({ summary: 'Get the events rated by the current user' })
  @ApiQuery({ type: QueryMyEventRatingsDto })
  @ApiResponse({ status: 200, type: PaginateMyEventRatingsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyRatings(
    @Req() req: AuthenticatedRequest,
    @Query() query: QueryMyEventRatingsDto,
  ): Promise<PaginateMyEventRatingsDto> {
    return this.eventRatingsService.getMyRatings(req.user.id, query)
  }

  @Post(':eventId/ratings')
  @ApiOperation({ summary: 'Set a rating for an event' })
  @ApiBody({ type: CreateEventRatingDto })
  @ApiResponse({
    status: 201,
    type: EventRatingResponseDto,
    description: 'The event rating has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Body() body: CreateEventRatingDto,
  ): Promise<EventRatingResponseDto> {
    return this.eventRatingsService.create(req.user.id, eventId, body)
  }

  @Patch('ratings/:eventRatingId')
  @ApiOperation({ summary: 'Update a rating for an event' })
  @ApiBody({ type: CreateEventRatingDto })
  @ApiResponse({
    status: 200,
    type: EventRatingResponseDto,
    description: 'The event rating has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('eventRatingId') eventRatingId: string,
    @Body() body: CreateEventRatingDto,
  ): Promise<EventRatingResponseDto> {
    return this.eventRatingsService.update(req.user.id, eventRatingId, body)
  }

  @Delete('ratings/:eventRatingId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove an event rating' })
  @ApiParam({ name: 'eventRatingId', type: String, description: 'The ID of the event rating' })
  @ApiResponse({ status: 204, description: 'The event rating has been successfully removed.' })
  @ApiResponse({ status: 404, description: 'Event rating not found.' })
  async remove(@Req() req: AuthenticatedRequest, @Param('eventRatingId') eventRatingId: string): Promise<void> {
    return this.eventRatingsService.remove(req.user.id, eventRatingId)
  }
}
