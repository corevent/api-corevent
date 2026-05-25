import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AttractionsService } from '~/modules/attractions/attractions.service'
import {
  AttractionResponseDto,
  CreateAttractionDto,
  PaginatedAttractionsDto,
  QueryAttractionsDto,
  UpdateAttractionDto,
} from '~/modules/attractions/dto/attractions.dto'

@ApiTags('Events - Attractions')
@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class AttractionsController {
  constructor(private readonly attractionsService: AttractionsService) {}

  @Post(':eventId/attractions')
  @ApiOperation({ summary: 'Create an attraction' })
  @ApiParam({ name: 'eventId', type: String, description: 'The ID of the event' })
  @ApiBody({ type: CreateAttractionDto })
  @ApiResponse({ status: 201, description: 'The attraction has been successfully created.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  async create(@Param('eventId') eventId: string, @Body() body: CreateAttractionDto): Promise<AttractionResponseDto> {
    return this.attractionsService.create(eventId, body)
  }

  @Patch(':attractionId')
  @ApiOperation({ summary: 'Update an attraction' })
  @ApiParam({ name: 'attractionId', type: String, description: 'The ID of the attraction' })
  @ApiBody({ type: UpdateAttractionDto })
  @ApiResponse({ status: 200, description: 'The attraction has been successfully updated.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiNotFoundResponse({ description: 'Attraction not found.' })
  async update(
    @Param('attractionId') attractionId: string,
    @Body() body: UpdateAttractionDto,
  ): Promise<AttractionResponseDto> {
    return this.attractionsService.update(attractionId, body)
  }

  @Get(':eventId/attractions')
  @ApiOperation({ summary: 'Get all attractions' })
  @ApiParam({ name: 'eventId', type: String, description: 'The ID of the event' })
  @ApiQuery({ type: QueryAttractionsDto })
  @ApiResponse({ status: 200, description: 'The attractions have been successfully retrieved.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiNotFoundResponse({ description: 'Event not found.' })
  async getAll(
    @Param('eventId') eventId: string,
    @Query() query: QueryAttractionsDto,
  ): Promise<PaginatedAttractionsDto> {
    return this.attractionsService.getAll(eventId, query)
  }

  @Get(':attractionId')
  @ApiOperation({ summary: 'Get an attraction by ID' })
  @ApiParam({ name: 'attractionId', type: String, description: 'The ID of the attraction' })
  @ApiResponse({ status: 200, description: 'The attraction has been successfully retrieved.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiNotFoundResponse({ description: 'Attraction not found.' })
  async getById(@Param('attractionId') attractionId: string): Promise<AttractionResponseDto> {
    return this.attractionsService.getById(attractionId)
  }

  @Delete(':attractionId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an attraction' })
  @ApiParam({ name: 'attractionId', type: String, description: 'The ID of the attraction' })
  @ApiResponse({ status: 204, description: 'The attraction has been successfully deleted.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiNotFoundResponse({ description: 'Attraction not found.' })
  async delete(@Param('attractionId') attractionId: string): Promise<void> {
    return this.attractionsService.delete(attractionId)
  }
}
