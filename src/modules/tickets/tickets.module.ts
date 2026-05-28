import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TicketsService } from '~/modules/tickets/tickets.service'
import { TicketsController } from '~/modules/tickets/tickets.controller'
import { Tickets } from '~/modules/tickets/tickets.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Tickets])],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
