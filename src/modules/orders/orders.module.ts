import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdersController } from '~/modules/orders/orders.controller'
import { Orders } from '~/modules/orders/orders.entity'
import { OrdersService } from '~/modules/orders/orders.service'
import { PagBankModule } from '~/modules/pagbank/pagbank.module'
import { TicketTypesModule } from '~/modules/ticket-types/ticket-types.module'
import { TicketsModule } from '~/modules/tickets/tickets.module'
import { UsersModule } from '~/modules/users/users.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Orders]),
    TicketTypesModule,
    forwardRef(() => PagBankModule),
    UsersModule,
    TicketsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
