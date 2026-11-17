import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
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
  @ApiCreatedResponse({ type: AttractionResponseDto, description: 'The attraction has been successfully created.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You do not have permission to access this event' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Body() body: CreateAttractionDto,
  ): Promise<AttractionResponseDto> {
    return this.attractionsService.create(req.user.id, eventId, body)
  }

  @Patch('attractions/:attractionId')
  @ApiOperation({ summary: 'Update an attraction' })
  @ApiParam({ name: 'attractionId', type: String, description: 'The ID of the attraction' })
  @ApiBody({ type: UpdateAttractionDto })
  @ApiOkResponse({ type: AttractionResponseDto, description: 'The attraction has been successfully updated.' })
  @ApiBadRequestResponse({ description: 'Invalid request body.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You do not have permission to access this event' })
  @ApiNotFoundResponse({ description: 'Attraction not found' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('attractionId') attractionId: string,
    @Body() body: UpdateAttractionDto,
  ): Promise<AttractionResponseDto> {
    return this.attractionsService.update(req.user.id, attractionId, body)
  }

  @Get(':eventId/attractions')
  @ApiOperation({ summary: 'Get all attractions' })
  @ApiParam({ name: 'eventId', type: String, description: 'The ID of the event' })
  @ApiOkResponse({ type: PaginatedAttractionsDto, description: 'The attractions have been successfully retrieved.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters. Page number is out of range.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getAll(
    @Param('eventId') eventId: string,
    @Query() query: QueryAttractionsDto,
  ): Promise<PaginatedAttractionsDto> {
    return this.attractionsService.getAll(eventId, query)
  }

  @Get('attractions/:attractionId')
  @ApiOperation({ summary: 'Get an attraction by ID' })
  @ApiParam({ name: 'attractionId', type: String, description: 'The ID of the attraction' })
  @ApiOkResponse({ type: AttractionResponseDto, description: 'The attraction has been successfully retrieved.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Attraction not found' })
  async getById(@Param('attractionId') attractionId: string): Promise<AttractionResponseDto> {
    return this.attractionsService.getById(attractionId)
  }

  @Delete('attractions/:attractionId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an attraction' })
  @ApiParam({ name: 'attractionId', type: String, description: 'The ID of the attraction' })
  @ApiNoContentResponse({ description: 'The attraction has been successfully deleted.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You do not have permission to access this event' })
  async delete(@Req() req: AuthenticatedRequest, @Param('attractionId') attractionId: string): Promise<void> {
    return this.attractionsService.delete(req.user.id, attractionId)
  }
}
