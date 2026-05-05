import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsBoolean, IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'
import { EventStatus } from '~/modules/events-module/events.entity'

export class CreateEventDto {
  @ApiProperty({ description: 'Title of the event', example: 'Event Title' })
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty({ description: 'Description of the event', example: 'Event Description' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string

  @ApiProperty({ description: 'Maximum number of participants', example: 100 })
  @IsInt()
  maxParticipants: number

  @ApiProperty({ description: 'City ID of the event', example: 1 })
  @IsInt()
  @IsOptional()
  cityId?: number

  @ApiProperty({ description: 'Address zip code', example: '12345678' })
  @IsString()
  @Length(8, 8)
  @IsOptional()
  zipCode?: string

  @ApiProperty({ description: 'Address neighborhood', example: 'Neighborhood' })
  @IsString()
  @IsOptional()
  neighborhood?: string

  @ApiProperty({ description: 'Address street', example: 'Street' })
  @IsString()
  @IsOptional()
  street?: string

  @ApiProperty({ description: 'Address number', example: 123 })
  @IsInt()
  @IsOptional()
  number?: number

  @ApiProperty({ description: 'Address complement', example: 'Complement' })
  @IsString()
  @IsOptional()
  complement?: string

  @ApiProperty({ description: 'Event start date', example: '2026-01-01T00:00:00.000Z' })
  @IsDate()
  startDate: Date

  @ApiProperty({ description: 'Event end date', example: '2026-01-01T00:00:00.000Z' })
  @IsDate()
  endDate: Date

  @ApiProperty({ description: 'Event banner URL', example: 'https://example.com/banner.jpg' })
  @IsString()
  @IsOptional()
  bannerUrl?: string

  @ApiProperty({ description: 'Event is adult only', example: false })
  @IsBoolean()
  isAdultOnly: boolean

  @ApiProperty({ description: 'Event status', example: EventStatus.PUBLISHED })
  @IsIn([EventStatus.DRAFT, EventStatus.PUBLISHED])
  status: EventStatus
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}

export class DataEventDto extends CreateEventDto {
  @ApiProperty({ description: 'Event ID', example: '123e4567-e89b-12d3-a456-426614174432' })
  id: string

  @ApiProperty({ description: 'Organizer (user) ID', example: '123e4567-e89b-12d3-a456-4266141740423' })
  organizerId: string

  @ApiProperty({ description: 'Event changes ID', example: '123e4567-e89b-12d3-a456-426614174792' })
  eventChangesId?: string

  @ApiProperty({ description: 'Refund deadline', example: '2026-01-01T00:00:00.000Z' })
  changeRefundDeadline?: Date
}

export class ResponseEventDto {
  @ApiProperty({ description: 'Data of the event', example: DataEventDto })
  data: DataEventDto
}
