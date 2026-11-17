import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AttractionsController } from '~/modules/attractions/attractions.controller'
import { Attractions } from '~/modules/attractions/attractions.entity'
import { AttractionsService } from '~/modules/attractions/attractions.service'
import { EventStaffModule } from '~/modules/event-staff/event-staff.module'

@Module({
  imports: [TypeOrmModule.forFeature([Attractions]), EventStaffModule],
  providers: [AttractionsService],
  exports: [AttractionsService],
  controllers: [AttractionsController],
})
export class AttractionsModule {}
