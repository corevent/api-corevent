import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { FavoritesDataDto, FavoritesResponseDto } from '~/modules/favorites/dto/favorites.controller'
import { Favorites } from '~/modules/favorites/favorites.entity'

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorites)
    private favoritesRepository: Repository<Favorites>,
  ) {}

  async create(userId: string, eventId: string): Promise<FavoritesResponseDto> {
    await this.checkIfFavoriteExists(userId, eventId)
    const favorite = this.favoritesRepository.create({ userId, eventId })
    const data = await this.favoritesRepository.save(favorite)
    return { data: plainToInstance(FavoritesDataDto, data) }
  }

  async remove(userId: string, favoriteId: string): Promise<void> {
    const { affected } = await this.favoritesRepository.delete({ id: favoriteId, userId })
    if (affected === 0) {
      throw new NotFoundException('Favorite not found')
    }
  }

  private async checkIfFavoriteExists(userId: string, eventId: string): Promise<void> {
    const favorite = await this.favoritesRepository.findOne({ where: { userId, eventId } })
    if (favorite) {
      throw new BadRequestException('Favorite already exists')
    }
  }
}
