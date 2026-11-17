import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventsModule } from '~/modules/events-module/events.module'
import { TicketTypesController } from '~/modules/ticket-types/ticket-types.controller'
import { TicketTypes } from '~/modules/ticket-types/ticket-types.entity'
import { TicketTypesService } from '~/modules/ticket-types/ticket-types.service'

@Module({
  imports: [TypeOrmModule.forFeature([TicketTypes]), forwardRef(() => EventsModule)],
  controllers: [TicketTypesController],
  providers: [TicketTypesService],
  exports: [TicketTypesService],
})
export class TicketTypesModule {}
