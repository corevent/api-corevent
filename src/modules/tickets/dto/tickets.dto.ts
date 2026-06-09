import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsString, Length } from 'class-validator'
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

  @ApiProperty({ description: 'Gateway transaction ID', example: 'ORDE_1234567890' })
  gatewayTransactionId: string
}

export class CheckinUserDto {
  @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string

  @ApiProperty({ description: 'User email', example: 'john.doe@example.com' })
  email: string
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
}

export class CheckinResponseDto {
  @ApiProperty({ description: 'Checkin data', type: CheckinDataDto })
  data: CheckinDataDto
}
