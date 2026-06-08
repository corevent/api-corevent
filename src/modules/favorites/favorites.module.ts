import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FavoritesController } from '~/modules/favorites/favorites.controller'
import { Favorites } from '~/modules/favorites/favorites.entity'
import { FavoritesService } from '~/modules/favorites/favorites.service'

@Module({
  imports: [TypeOrmModule.forFeature([Favorites])],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
