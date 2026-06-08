import { Controller, Delete, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
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
  @ApiResponse({ status: 201, type: FavoritesResponseDto, description: 'The favorite has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(@Req() req: AuthenticatedRequest, @Param('eventId') eventId: string): Promise<FavoritesResponseDto> {
    return this.favoritesService.create(req.user.id, eventId)
  }

  @Delete(':favoriteId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a favorite' })
  @ApiParam({ name: 'favoriteId', type: String, description: 'The ID of the favorite' })
  @ApiResponse({ status: 204, description: 'The favorite has been successfully removed.' })
  @ApiResponse({ status: 404, description: 'Favorite not found.' })
  async remove(@Req() req: AuthenticatedRequest, @Param('favoriteId') favoriteId: string): Promise<void> {
    return this.favoritesService.remove(req.user.id, favoriteId)
  }
}
