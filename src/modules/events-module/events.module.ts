import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventChangesModule } from '~/modules/event-changes/event-changes.module'
import { EventsController } from '~/modules/events-module/events.controller'
import { Events } from '~/modules/events-module/events.entity'
import { EventsService } from '~/modules/events-module/events.service'
import { EventsCronService } from '~/modules/events-module/jobs/finish-events.job'
import { OrganizerPaymentInfoModule } from '~/modules/organizer-payment-info/organizer-payment-info.module'

@Module({
  imports: [TypeOrmModule.forFeature([Events]), EventChangesModule, OrganizerPaymentInfoModule],
  controllers: [EventsController],
  providers: [EventsService, EventsCronService],
  exports: [EventsService, EventsCronService],
})
export class EventsModule {}
