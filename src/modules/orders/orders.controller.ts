import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { CreateOrderDto, OrderDetailsResponseDto, OrderResponseDto } from '~/modules/orders/dto/orders.dto'
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

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Get order details by ID' })
  @ApiParam({ name: 'orderId', description: 'The ID of the order' })
  @ApiResponse({ status: 200, type: OrderDetailsResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async getById(@Req() req: AuthenticatedRequest, @Param('orderId') orderId: string): Promise<OrderDetailsResponseDto> {
    return this.ordersService.getOrderById(req.user.id, orderId)
  }
}
