import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventsModule } from '~/modules/events-module/events.module'
import { OrdersController } from '~/modules/orders/orders.controller'
import { OrdersSuccessController } from '~/modules/orders/orders-success.controller'
import { OrderItems } from '~/modules/orders/order-items.entity'
import { Orders } from '~/modules/orders/orders.entity'
import { OrdersPurchaseValidationService } from '~/modules/orders/orders-purchase-validation.service'
import { OrdersPurchaseService } from '~/modules/orders/orders-purchase.service'
import { OrdersQueryService } from '~/modules/orders/orders-query.service'
import { OrdersService } from '~/modules/orders/orders.service'
import { OrdersWebhookService } from '~/modules/orders/orders-webhook.service'
import { PagBankModule } from '~/modules/pagbank/pagbank.module'
import { TicketTypesModule } from '~/modules/ticket-types/ticket-types.module'
import { TicketsModule } from '~/modules/tickets/tickets.module'
import { UsersModule } from '~/modules/users/users.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Orders, OrderItems]),
    TicketTypesModule,
    EventsModule,
    forwardRef(() => PagBankModule),
    UsersModule,
    TicketsModule,
  ],
  controllers: [OrdersController, OrdersSuccessController],
  providers: [
    OrdersPurchaseValidationService,
    OrdersPurchaseService,
    OrdersQueryService,
    OrdersWebhookService,
    OrdersService,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
