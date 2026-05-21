import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventStaff } from '~/modules/event-staff/event-staff.entity'
import { EventStaffService } from '~/modules/event-staff/event-staff.service'
import { EventStaffController } from '~/modules/event-staff/event-staff.controller'
import { EventsModule } from '~/modules/events-module/events.module'

@Module({
  imports: [TypeOrmModule.forFeature([EventStaff]), EventsModule],
  providers: [EventStaffService],
  exports: [EventStaffService],
  controllers: [EventStaffController],
})
export class EventStaffModule {}
