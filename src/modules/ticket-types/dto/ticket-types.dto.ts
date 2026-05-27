import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger'
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { PaginationMetaDto, QueryPaginationDto } from '~/common/pagination/pagination.dto'

export class CreateTicketTypeDto {
  @ApiProperty({ description: 'Name of the ticket type', example: 'Ticket Type Name' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'Price of the ticket type', example: 100 })
  @IsNumber()
  price: number

  @ApiProperty({ description: 'Total quantity of tickets for this ticket type', example: 100 })
  @IsInt()
  @Min(1)
  totalQuantity: number

  @ApiProperty({ description: 'Start date of the ticket type', example: '2026-01-01T00:00:00.000Z' })
  @IsDate()
  startDate: Date

  @ApiProperty({ description: 'End date of the ticket type', example: '2026-01-01T00:00:00.000Z' })
  @IsDate()
  endDate: Date
}

// Only update for draft events
export class UpdateTicketTypeDto extends PartialType(CreateTicketTypeDto) {}

export class TicketTypeDataDto extends CreateTicketTypeDto {
  @ApiProperty({ description: 'Ticket type ID', example: '123e4567-e89b-12d3-a456-426614174432' })
  id: string

  @ApiProperty({ description: 'Event ID', example: '123e4567-e89b-12d3-a456-426614174432' })
  eventId: string

  @ApiProperty({ description: 'Available quantity of tickets for this ticket type', example: 100 })
  availableQuantity: number
}

export class TicketTypeResponseDto {
  @ApiProperty({ description: 'Ticket type data', type: TicketTypeDataDto })
  data: TicketTypeDataDto
}

export class TicketTypesListDto extends OmitType(TicketTypeDataDto, ['eventId']) {}

export class PaginatedTicketTypesListDto {
  @ApiProperty({ description: 'List of ticket types', type: [TicketTypesListDto] })
  data: TicketTypesListDto[]

  @ApiProperty({ description: 'Pagination meta', type: PaginationMetaDto })
  meta: PaginationMetaDto
}

export class QueryTicketTypesDto extends QueryPaginationDto {
  @ApiProperty({
    description: 'Filter by available only (user -> startDate <= now <= endDate) or all (organizer)',
    example: true,
  })
  @IsBoolean()
  availableOnly: boolean

  @ApiProperty({ description: 'Search by name', example: 'Ticket Type Name', required: false })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ description: 'Filter by start date', example: '2026-01-01T00:00:00.000Z', required: false })
  @IsDate()
  @IsOptional()
  startDate?: Date

  @ApiProperty({ description: 'Filter by end date', example: '2026-01-01T00:00:00.000Z', required: false })
  @IsDate()
  @IsOptional()
  endDate?: Date
}
