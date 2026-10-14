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
  @ApiOkResponse({ type: PaginateMyEventRatingsDto, description: 'The events rated by the current user.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters. Page number is out of range.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getMyRatings(
    @Req() req: AuthenticatedRequest,
    @Query() query: QueryMyEventRatingsDto,
  ): Promise<PaginateMyEventRatingsDto> {
    return this.eventRatingsService.getMyRatings(req.user.id, query)
  }

  @Post(':eventId/ratings')
  @ApiOperation({ summary: 'Set a rating for an event' })
  @ApiBody({ type: CreateEventRatingDto })
  @ApiCreatedResponse({
    type: EventRatingResponseDto,
    description: 'The event rating has been successfully created.',
  })
  @ApiBadRequestResponse({ description: 'You have already rated this event' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
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
  @ApiOkResponse({
    type: EventRatingResponseDto,
    description: 'The event rating has been successfully updated.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Event rating not found' })
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
  @ApiNoContentResponse({ description: 'The event rating has been successfully removed.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Event rating not found' })
  async remove(@Req() req: AuthenticatedRequest, @Param('eventRatingId') eventRatingId: string): Promise<void> {
    return this.eventRatingsService.remove(req.user.id, eventRatingId)
  }
}
