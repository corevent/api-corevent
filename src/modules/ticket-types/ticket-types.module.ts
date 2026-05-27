import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TicketTypes } from '~/modules/ticket-types/ticket-types.entity'
import { TicketTypesService } from '~/modules/ticket-types/ticket-types.service'
import { TicketTypesController } from '~/modules/ticket-types/ticket-types.controller'

@Module({
  imports: [TypeOrmModule.forFeature([TicketTypes])],
  controllers: [TicketTypesController],
  providers: [TicketTypesService],
  exports: [TicketTypesService],
})
export class TicketTypesModule {}
