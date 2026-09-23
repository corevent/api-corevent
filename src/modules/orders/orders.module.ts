import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdersController } from '~/modules/orders/orders.controller'
import { OrdersSuccessController } from '~/modules/orders/orders-success.controller'
import { OrderItems } from '~/modules/orders/order-items.entity'
import { Orders } from '~/modules/orders/orders.entity'
import { OrdersService } from '~/modules/orders/orders.service'
import { PagBankModule } from '~/modules/pagbank/pagbank.module'
import { TicketTypesModule } from '~/modules/ticket-types/ticket-types.module'
import { TicketsModule } from '~/modules/tickets/tickets.module'
import { UsersModule } from '~/modules/users/users.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Orders, OrderItems]),
    TicketTypesModule,
    forwardRef(() => PagBankModule),
    UsersModule,
    TicketsModule,
  ],
  controllers: [OrdersController, OrdersSuccessController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
