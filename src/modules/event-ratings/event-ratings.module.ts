import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventRatingsController } from '~/modules/event-ratings/event-ratings.controller'
import { EventRatings } from '~/modules/event-ratings/event-ratings.entity'
import { EventRatingsService } from '~/modules/event-ratings/event-ratings.service'

@Module({
  imports: [TypeOrmModule.forFeature([EventRatings])],
  controllers: [EventRatingsController],
  providers: [EventRatingsService],
  exports: [EventRatingsService],
})
export class EventRatingsModule {}
