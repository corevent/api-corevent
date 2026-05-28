import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { OrdersService } from '~/modules/orders/orders.service'

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
}
