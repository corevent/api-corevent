import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator'
import { PaginationMetaDto, QueryPaginationDto } from '~/common/pagination/pagination.dto'
import { OrderStatus } from '~/modules/orders/orders.entity'
import { TicketStatus } from '~/modules/tickets/tickets.entity'

export class CheckinDto {
  @ApiProperty({ description: 'QR code token', example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  @Length(64, 64) // 32 bytes em hex
  qrToken: string
}

export class CheckinTicketTypeDto {
  @ApiProperty({ description: 'Ticket type ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'Ticket type name', example: 'VIP' })
  name: string

  @ApiProperty({ description: 'Ticket type price', example: 100 })
  @Type(() => Number)
  price: number
}

export class CheckinEventDto {
  @ApiProperty({ description: 'Event ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'Event title', example: 'Summer Festival' })
  title: string
}

export class CheckinOrderDto {
  @ApiProperty({ description: 'Order ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'Order status', example: OrderStatus.PAID })
  status: OrderStatus

  @ApiPropertyOptional({ description: 'Gateway transaction ID. Omitted for free orders.', example: 'ORDE_1234567890' })
  gatewayTransactionId?: string | null
}

export class CheckinUserDto {
  @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string

  @ApiProperty({ description: 'User email', example: 'john.doe@example.com' })
  email: string
}

export class CheckinStaffUserDto {
  @ApiProperty({ description: 'Staff user ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'Staff user name', example: 'Jane Staff' })
  name: string
}

export class CheckinDataDto {
  @ApiProperty({ description: 'Ticket ID', example: '1234567890' })
  ticketId: string

  @ApiProperty({ description: 'Ticket type ID', example: '1234567890' })
  ticketTypeId: string

  @ApiProperty({ description: 'Ticket status', example: TicketStatus.CHECKED_IN })
  status: TicketStatus

  @ApiProperty({ description: 'Checkin at', example: '2026-01-01T00:00:00.000Z' })
  checkinAt: Date

  @ApiProperty({ description: 'Ticket type', type: CheckinTicketTypeDto })
  @Type(() => CheckinTicketTypeDto)
  ticketType: CheckinTicketTypeDto

  @ApiProperty({ description: 'Event', type: CheckinEventDto })
  @Type(() => CheckinEventDto)
  event: CheckinEventDto

  @ApiProperty({ description: 'Order', type: CheckinOrderDto })
  @Type(() => CheckinOrderDto)
  order: CheckinOrderDto

  @ApiProperty({ description: 'User', type: CheckinUserDto })
  @Type(() => CheckinUserDto)
  user: CheckinUserDto

  @ApiProperty({ description: 'Staff user who performed the checkin', type: CheckinStaffUserDto })
  @Type(() => CheckinStaffUserDto)
  checkedInBy: CheckinStaffUserDto
}

export class CheckinResponseDto {
  @ApiProperty({ description: 'Checkin data', type: CheckinDataDto })
  data: CheckinDataDto
}

export class QueryMyTicketsDto extends QueryPaginationDto {
  @ApiPropertyOptional({ description: 'Filter by event ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  eventId?: string
}

export class UserTicketTypeDto {
  @ApiProperty({ description: 'Ticket type ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'Ticket type name', example: 'VIP' })
  name: string

  @ApiProperty({ description: 'Ticket type price', example: 100 })
  @Type(() => Number)
  price: number
}

export class UserTicketEventDto {
  @ApiProperty({ description: 'Event ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'Event title', example: 'Summer Festival' })
  title: string
}

export class UserTicketOrderDto {
  @ApiProperty({ description: 'Order ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'Order status', example: OrderStatus.PAID })
  status: OrderStatus
}

export class UserTicketDataDto {
  @ApiProperty({ description: 'Ticket ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'Event ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  eventId: string

  @ApiProperty({ description: 'Ticket type ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  ticketTypeId: string

  @ApiProperty({ description: 'Ticket status', example: TicketStatus.PENDING })
  status: TicketStatus

  @ApiPropertyOptional({ description: 'Check-in date', example: '2026-01-01T00:00:00.000Z' })
  checkinAt?: Date

  @ApiProperty({
    description: 'QR code token',
    example: 'a4174821114a75118c7ede39152b3f45523559ded1875d294ad1ce790a9d2bd8',
  })
  qrToken: string

  @ApiProperty({ description: 'Ticket type', type: UserTicketTypeDto })
  @Type(() => UserTicketTypeDto)
  ticketType: UserTicketTypeDto

  @ApiProperty({ description: 'Event', type: UserTicketEventDto })
  @Type(() => UserTicketEventDto)
  event: UserTicketEventDto

  @ApiProperty({ description: 'Order', type: UserTicketOrderDto })
  @Type(() => UserTicketOrderDto)
  order: UserTicketOrderDto
}

export class MyTicketsResponseDto {
  @ApiProperty({ description: 'Tickets', type: [UserTicketDataDto] })
  data: UserTicketDataDto[]
}

export class PaginateMyTicketsDto {
  @ApiProperty({ description: 'Tickets', type: [UserTicketDataDto] })
  data: UserTicketDataDto[]

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta: PaginationMetaDto
}
