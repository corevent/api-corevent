import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { QueryPaginationDto } from '~/common/pagination/pagination.dto'
import {
  CreateOrderDto,
  OrderDetailsResponseDto,
  OrderResponseDto,
  PaginateMyOrdersDto,
} from '~/modules/orders/dto/orders.dto'
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

  @Get('my/orders')
  @ApiOperation({ summary: 'Get my orders' })
  @ApiQuery({ type: QueryPaginationDto })
  @ApiResponse({ status: 200, type: PaginateMyOrdersDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyOrders(
    @Req() req: AuthenticatedRequest,
    @Query() query: QueryPaginationDto,
  ): Promise<PaginateMyOrdersDto> {
    return this.ordersService.getMyOrders(req.user.id, query)
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
