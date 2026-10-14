import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, IsUUID, Length } from 'class-validator'
import { PaginationMetaDto, QueryPaginationDto } from '~/common/pagination/pagination.dto'
import { OrderStatus } from '~/modules/orders/orders.entity'
import { TicketStatus } from '~/modules/tickets/tickets.entity'

export class CheckinDto {
  @ApiProperty({
    description: 'QR code token',
    type: String,
    example: '1234567890',
    minLength: 64,
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty()
  @Length(64, 64) // 32 bytes em hex
  qrToken!: string
}

export class CheckinTicketTypeDto {
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

export class CheckinEventDto {
  @ApiProperty({
    description: 'Event ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({ description: 'Event title', type: String, example: 'Summer Festival' })
  title!: string
}

export class CheckinOrderDto {
  @ApiProperty({
    description: 'Order ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({ description: 'Order status', enum: OrderStatus, example: OrderStatus.PAID })
  status!: OrderStatus

  @ApiPropertyOptional({
    description: 'Gateway transaction ID. Omitted for free orders.',
    type: String,
    example: 'ORDE_1234567890',
    nullable: true,
  })
  gatewayTransactionId?: string | null
}

export class CheckinUserDto {
  @ApiProperty({
    description: 'User ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({ description: 'User name', type: String, example: 'John Doe' })
  name!: string

  @ApiProperty({
    description: 'User email',
    type: String,
    format: 'email',
    example: 'john.doe@example.com',
  })
  email!: string
}

export class CheckinStaffUserDto {
  @ApiProperty({
    description: 'Staff user ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({ description: 'Staff user name', type: String, example: 'Jane Staff' })
  name!: string
}

export class CheckinDataDto {
  @ApiProperty({ description: 'Ticket ID', type: String, example: '1234567890' })
  ticketId!: string

  @ApiProperty({ description: 'Ticket type ID', type: String, example: '1234567890' })
  ticketTypeId!: string

  @ApiProperty({ description: 'Ticket status', enum: TicketStatus, example: TicketStatus.CHECKED_IN })
  status!: TicketStatus

  @ApiProperty({
    description: 'Checkin at',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
  })
  checkinAt!: Date

  @ApiProperty({ description: 'Ticket type', type: CheckinTicketTypeDto })
  @Type(() => CheckinTicketTypeDto)
  ticketType!: CheckinTicketTypeDto

  @ApiProperty({ description: 'Event', type: CheckinEventDto })
  @Type(() => CheckinEventDto)
  event!: CheckinEventDto

  @ApiProperty({ description: 'Order', type: CheckinOrderDto })
  @Type(() => CheckinOrderDto)
  order!: CheckinOrderDto

  @ApiProperty({ description: 'User', type: CheckinUserDto })
  @Type(() => CheckinUserDto)
  user!: CheckinUserDto

  @ApiProperty({ description: 'Staff user who performed the checkin', type: CheckinStaffUserDto })
  @Type(() => CheckinStaffUserDto)
  checkedInBy!: CheckinStaffUserDto
}

export class CheckinResponseDto {
  @ApiProperty({ description: 'Checkin data', type: CheckinDataDto })
  data!: CheckinDataDto
}

export class QueryMyTicketsDto extends QueryPaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by event ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  eventId?: string
}

export class UserTicketTypeDto {
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

export class UserTicketEventDto {
  @ApiProperty({
    description: 'Event ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({ description: 'Event title', type: String, example: 'Summer Festival' })
  title!: string
}

export class UserTicketOrderDto {
  @ApiProperty({
    description: 'Order ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({ description: 'Order status', enum: OrderStatus, example: OrderStatus.PAID })
  status!: OrderStatus
}

export class UserTicketDataDto {
  @ApiProperty({
    description: 'Ticket ID',
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

  @ApiProperty({ description: 'Ticket type', type: UserTicketTypeDto })
  @Type(() => UserTicketTypeDto)
  ticketType!: UserTicketTypeDto

  @ApiProperty({ description: 'Event', type: UserTicketEventDto })
  @Type(() => UserTicketEventDto)
  event!: UserTicketEventDto

  @ApiProperty({ description: 'Order', type: UserTicketOrderDto })
  @Type(() => UserTicketOrderDto)
  order!: UserTicketOrderDto
}

export class MyTicketsResponseDto {
  @ApiProperty({ description: 'Tickets', type: [UserTicketDataDto] })
  data!: UserTicketDataDto[]
}

export class PaginateMyTicketsDto {
  @ApiProperty({ description: 'Tickets', type: [UserTicketDataDto] })
  data!: UserTicketDataDto[]

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta!: PaginationMetaDto
}

export class QueryEventParticipantsDto extends QueryPaginationDto {}

export class EventParticipantDto {
  @ApiProperty({
    description: 'User ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({ description: 'User name', type: String, example: 'John Doe' })
  name!: string

  @ApiProperty({
    description: 'User email',
    type: String,
    format: 'email',
    example: 'john.doe@example.com',
  })
  email!: string

  @ApiProperty({ description: 'Number of tickets owned by the user for this event', type: Number, example: 2 })
  @Type(() => Number)
  ticketsCount!: number
}

export class PaginateEventParticipantsDto {
  @ApiProperty({ description: 'Event participants', type: [EventParticipantDto] })
  @Type(() => EventParticipantDto)
  data!: EventParticipantDto[]

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  @Type(() => PaginationMetaDto)
  meta!: PaginationMetaDto
}

export class EventParticipantTicketDto {
  @ApiProperty({
    description: 'Ticket ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

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
    description: 'Ticket creation date',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
  })
  createdAt!: Date

  @ApiProperty({ description: 'Ticket type', type: UserTicketTypeDto })
  @Type(() => UserTicketTypeDto)
  ticketType!: UserTicketTypeDto

  @ApiProperty({ description: 'Order', type: UserTicketOrderDto })
  @Type(() => UserTicketOrderDto)
  order!: UserTicketOrderDto
}

export class EventParticipantDetailsDataDto {
  @ApiProperty({ description: 'Participant user', type: CheckinUserDto })
  @Type(() => CheckinUserDto)
  user!: CheckinUserDto

  @ApiProperty({ description: 'Participant tickets', type: [EventParticipantTicketDto] })
  @Type(() => EventParticipantTicketDto)
  tickets!: EventParticipantTicketDto[]
}

export class EventParticipantDetailsResponseDto {
  @ApiProperty({ description: 'Participant details', type: EventParticipantDetailsDataDto })
  @Type(() => EventParticipantDetailsDataDto)
  data!: EventParticipantDetailsDataDto
}
