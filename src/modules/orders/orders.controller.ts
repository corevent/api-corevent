import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
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
  @ApiCreatedResponse({ type: OrderResponseDto, description: 'The order has been successfully created.' })
  @ApiBadRequestResponse({
    description: [
      'Free ticket is limited to 1 per user.',
      'You already have a ticket for this type.',
      'Cannot mix free and paid tickets in the same order.',
      'Not enough tickets available.',
    ].join(' '),
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Ticket type not found' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Body() body: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(req.user.id, eventId, body)
  }

  @Get('my/orders')
  @ApiOperation({ summary: 'Get my orders' })
  @ApiOkResponse({ type: PaginateMyOrdersDto, description: 'The orders of the current user.' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters. Page number is out of range.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getMyOrders(
    @Req() req: AuthenticatedRequest,
    @Query() query: QueryPaginationDto,
  ): Promise<PaginateMyOrdersDto> {
    return this.ordersService.getMyOrders(req.user.id, query)
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Get order details by ID' })
  @ApiParam({ name: 'orderId', description: 'The ID of the order' })
  @ApiOkResponse({ type: OrderDetailsResponseDto, description: 'The order details.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'You do not own this order' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async getById(@Req() req: AuthenticatedRequest, @Param('orderId') orderId: string): Promise<OrderDetailsResponseDto> {
    return this.ordersService.getOrderById(req.user.id, orderId)
  }
}
