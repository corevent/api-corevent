import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsInt, IsUUID, ValidateNested } from 'class-validator'
import { PaginationMetaDto } from '~/common/pagination/pagination.dto'
import { OrderStatus } from '~/modules/orders/orders.entity'
import { TicketStatus } from '~/modules/tickets/tickets.entity'

class ItemsDto {
  @ApiProperty({
    description: 'Ticket type ID',
    type: String,
    format: 'uuid',
    example: '1234567890',
  })
  @IsUUID()
  ticketTypeId!: string

  @ApiProperty({ description: 'Quantity', type: Number, example: 1 })
  @IsInt()
  quantity!: number
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Items', type: [ItemsDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemsDto)
  items!: ItemsDto[]
}

export class CheckoutDataDto {
  @ApiProperty({ description: 'Link relation', type: String, example: 'self' })
  rel!: string

  @ApiProperty({
    description: 'Link href',
    type: String,
    example: 'https://api.pagbank.com/v1/checkouts/123e4567-e89b-12d3-a456-426614174000',
  })
  href!: string

  @ApiProperty({ description: 'Link method', type: String, example: 'GET' })
  method!: string
}

export class OrderDataDto {
  @ApiProperty({
    description: 'Order ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  orderId!: string

  @ApiProperty({ description: 'Checkout links', type: [CheckoutDataDto] })
  checkoutLinks!: CheckoutDataDto[]

  @ApiProperty({ description: 'QR codes', type: [String] })
  qrCodes!: string[]

  @ApiProperty({ description: 'Ticket IDs', type: [String] })
  ticketIds!: string[]
}

export class OrderResponseDto {
  @ApiProperty({ description: 'Order data', type: OrderDataDto })
  data!: OrderDataDto
}

export class OrderTicketTypeDto {
  @ApiProperty({
    description: 'Ticket type ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({ description: 'Ticket type name', type: String, example: 'VIP' })
  name!: string

  @ApiProperty({ description: 'Ticket type price', type: Number, example: 100 })
  @Type(() => Number)
  price!: number
}

export class OrderTicketDto {
  @ApiProperty({
    description: 'Ticket ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({
    description: 'Ticket type ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  ticketTypeId!: string

  @ApiProperty({ description: 'Ticket status', enum: TicketStatus, example: TicketStatus.PENDING })
  status!: TicketStatus

  @ApiPropertyOptional({
    description: 'Check-in date',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
  })
  checkinAt?: Date

  @ApiProperty({
    description: 'QR code token',
    type: String,
    example: 'a4174821114a75118c7ede39152b3f45523559ded1875d294ad1ce790a9d2bd8',
  })
  qrToken!: string

  @ApiProperty({ description: 'Ticket type', type: OrderTicketTypeDto })
  @Type(() => OrderTicketTypeDto)
  ticketType!: OrderTicketTypeDto
}

export class OrderEventDto {
  @ApiProperty({
    description: 'Event ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id!: string

  @ApiProperty({ description: 'Event title', type: String, example: 'Summer Festival' })
  @Expose()
  title!: string

  @ApiProperty({
    description: 'Event start date',
    type: String,
    format: 'date-time',
    example: '2026-06-09T10:55:10.000Z',
  })
  @Expose()
  startDate!: Date

  @ApiProperty({
    description: 'Event end date',
    type: String,
    format: 'date-time',
    example: '2026-06-09T10:55:10.000Z',
  })
  @Expose()
  endDate!: Date
}

export class OrderCheckoutDto {
  @ApiProperty({
    description: 'PagBank checkout ID',
    type: String,
    example: 'CHEC_EAEDE53B-0BCB-4BF0-90AD-5703844FB9F9',
  })
  id!: string

  @ApiProperty({ description: 'PagBank checkout status', type: String, example: 'ACTIVE' })
  status!: string

  @ApiProperty({
    description: 'Checkout creation date',
    type: String,
    format: 'date-time',
    example: '2026-06-09T10:55:10-03:00',
  })
  createdAt!: string

  @ApiProperty({ description: 'Checkout links', type: [CheckoutDataDto] })
  checkoutLinks!: CheckoutDataDto[]

  @ApiPropertyOptional({
    description: 'PagBank order IDs generated after payment',
    type: [String],
    example: ['ORDE_7E04ED61-4303-4E12-B479-D73F2DDDA8BA'],
  })
  gatewayOrderIds?: string[]
}

export class OrderDetailsDataDto {
  @ApiProperty({
    description: 'Order ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({
    description: 'Event ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  eventId!: string

  @ApiProperty({ description: 'Order status', enum: OrderStatus, example: OrderStatus.PENDING })
  status!: OrderStatus

  @ApiProperty({ description: 'Total amount', type: Number, example: 100 })
  totalAmount!: number

  @ApiProperty({
    description: 'Order creation date',
    type: String,
    format: 'date-time',
    example: '2026-06-09T10:55:10.000Z',
  })
  createdAt!: Date

  @ApiProperty({ description: 'Event', type: OrderEventDto })
  @Type(() => OrderEventDto)
  event!: OrderEventDto

  @ApiPropertyOptional({ description: 'PagBank checkout. Omitted for free orders.', type: OrderCheckoutDto })
  @Type(() => OrderCheckoutDto)
  checkout?: OrderCheckoutDto

  @ApiProperty({ description: 'Tickets', type: [OrderTicketDto] })
  @Type(() => OrderTicketDto)
  tickets!: OrderTicketDto[]
}

export class OrderDetailsResponseDto {
  @ApiProperty({ description: 'Order details', type: OrderDetailsDataDto })
  data!: OrderDetailsDataDto
}

export class MyOrdersDataDto {
  @ApiProperty({
    description: 'Order ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id!: string

  @ApiProperty({ description: 'Event', type: OrderEventDto })
  @Type(() => OrderEventDto)
  @Expose()
  event!: OrderEventDto

  @ApiProperty({ description: 'Total amount', type: Number, example: 100 })
  @Expose()
  totalAmount!: number

  @ApiProperty({ description: 'Order status', enum: OrderStatus, example: OrderStatus.PENDING })
  @Expose()
  status!: OrderStatus

  @ApiProperty({
    description: 'Order creation date',
    type: String,
    format: 'date-time',
    example: '2026-06-09T10:55:10.000Z',
  })
  @Expose()
  createdAt!: Date
}

export class PaginateMyOrdersDto {
  @ApiProperty({ description: 'List of orders', type: [MyOrdersDataDto] })
  @Type(() => MyOrdersDataDto)
  data!: MyOrdersDataDto[]

  @ApiProperty({ description: 'Pagination meta', type: PaginationMetaDto })
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto
}
