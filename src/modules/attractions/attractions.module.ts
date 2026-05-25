import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AttractionsController } from '~/modules/attractions/attractions.controller'
import { Attractions } from '~/modules/attractions/attractions.entity'
import { AttractionsService } from '~/modules/attractions/attractions.service'

@Module({
  imports: [TypeOrmModule.forFeature([Attractions])],
  providers: [AttractionsService],
  exports: [AttractionsService],
  controllers: [AttractionsController],
})
export class AttractionsModule {}
