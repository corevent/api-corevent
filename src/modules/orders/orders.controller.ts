import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { CreateOrderDto, OrderResponseDto } from '~/modules/orders/dto/orders.dto'
import { OrdersService } from '~/modules/orders/orders.service'

@ApiTags('Orders')
@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post(':eventId/orders')
  @ApiOperation({ summary: 'Create an order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, type: OrderResponseDto, description: 'The order has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Body() body: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(req.user.id, eventId, body)
  }
}
