import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrdersController } from '~/modules/orders/orders.controller'
import { OrdersService } from '~/modules/orders/orders.service'
import { Orders } from '~/modules/orders/orders.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Orders])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
