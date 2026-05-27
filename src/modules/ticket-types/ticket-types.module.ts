import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TicketTypes } from '~/modules/ticket-types/ticket-types.entity'
import { TicketTypesService } from '~/modules/ticket-types/ticket-types.service'
import { TicketTypesController } from '~/modules/ticket-types/ticket-types.controller'
import { EventsModule } from '~/modules/events-module/events.module'

@Module({
  imports: [TypeOrmModule.forFeature([TicketTypes]), EventsModule],
  controllers: [TicketTypesController],
  providers: [TicketTypesService],
  exports: [TicketTypesService],
})
export class TicketTypesModule {}
