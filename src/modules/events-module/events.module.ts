import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventChangesModule } from '~/modules/event-changes/event-changes.module'
import { EventStaffModule } from '~/modules/event-staff/event-staff.module'
import { StorageModule } from '~/modules/storage/storage.module'
import { TicketTypesModule } from '~/modules/ticket-types/ticket-types.module'
import { EventsCancelService } from '~/modules/events-module/events-cancel.service'
import { EventsController } from '~/modules/events-module/events.controller'
import { Events } from '~/modules/events-module/events.entity'
import { EventsQueryService } from '~/modules/events-module/events-query.service'
import { EventsService } from '~/modules/events-module/events.service'
import { EventsCronService } from '~/modules/events-module/jobs/finish-events.job'
import { OrganizerPaymentInfoModule } from '~/modules/organizer-payment-info/organizer-payment-info.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Events]),
    EventChangesModule,
    forwardRef(() => OrganizerPaymentInfoModule),
    forwardRef(() => StorageModule),
    forwardRef(() => EventStaffModule),
    forwardRef(() => TicketTypesModule),
  ],
  controllers: [EventsController],
  providers: [EventsQueryService, EventsCancelService, EventsService, EventsCronService],
  exports: [EventsService, EventsCronService],
})
export class EventsModule {}
