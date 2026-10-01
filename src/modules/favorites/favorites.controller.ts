import { Controller, Delete, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { FavoritesResponseDto } from '~/modules/favorites/dto/favorites.controller'
import { FavoritesService } from '~/modules/favorites/favorites.service'

@ApiTags('Favorites')
@UseGuards(AuthGuard('jwt'))
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('events/:eventId')
  @ApiOperation({ summary: 'Create a favorite' })
  @ApiParam({ name: 'eventId', type: String, description: 'The ID of the event' })
  @ApiCreatedResponse({ type: FavoritesResponseDto, description: 'The favorite has been successfully created.' })
  @ApiBadRequestResponse({ description: 'Favorite already exists' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(@Req() req: AuthenticatedRequest, @Param('eventId') eventId: string): Promise<FavoritesResponseDto> {
    return this.favoritesService.create(req.user.id, eventId)
  }

  @Delete(':favoriteId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a favorite' })
  @ApiParam({ name: 'favoriteId', type: String, description: 'The ID of the favorite' })
  @ApiNoContentResponse({ description: 'The favorite has been successfully removed.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Favorite not found' })
  async remove(@Req() req: AuthenticatedRequest, @Param('favoriteId') favoriteId: string): Promise<void> {
    return this.favoritesService.remove(req.user.id, favoriteId)
  }
}
