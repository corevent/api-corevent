import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventStaffModule } from '~/modules/event-staff/event-staff.module'
import { EventsModule } from '~/modules/events-module/events.module'
import { UsersModule } from '~/modules/users/users.module'
import { TicketsController } from '~/modules/tickets/tickets.controller'
import { UserTicketsController } from '~/modules/tickets/user-tickets.controller'
import { Tickets } from '~/modules/tickets/tickets.entity'
import { TicketsService } from '~/modules/tickets/tickets.service'

@Module({
  imports: [TypeOrmModule.forFeature([Tickets]), EventsModule, EventStaffModule, UsersModule],
  controllers: [TicketsController, UserTicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
