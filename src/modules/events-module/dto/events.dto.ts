import { ApiProperty, PartialType } from '@nestjs/swagger'
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator'
import { PaginationMetaDto, QueryPaginationDto } from '~/common/pagination/pagination.dto'
import { EventCategory, EventLocationType, EventStatus } from '~/modules/events-module/events.entity'

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

  @ApiProperty({
    description: 'Location type. Note: if the location type is not online, the address fields are required',
    example: EventLocationType.IN_PERSON,
  })
  @IsEnum(EventLocationType)
  locationType: EventLocationType

  @ApiProperty({ description: 'Location name', example: 'Zézinho Magalhães Stadium' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  locationName?: string

  @ApiProperty({ description: 'City ID of the event', example: 3525300 })
  @IsInt()
  @Min(1)
  @IsOptional()
  cityId?: number

  @ApiProperty({ description: 'Address zip code', example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  @IsOptional()
  zipCode?: string

  @ApiProperty({ description: 'Address neighborhood', example: 'Neighborhood' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  neighborhood?: string

  @ApiProperty({ description: 'Address street', example: 'Street' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  street?: string

  @ApiProperty({ description: 'Address number', example: 123 })
  @IsInt()
  @Min(1)
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

  @ApiProperty({ description: 'Event category', example: EventCategory.MUSIC })
  @IsEnum(EventCategory)
  category: EventCategory

  @ApiProperty({ description: 'Event banner URL', example: 'https://example.com/banner.jpg' })
  @IsString()
  @IsOptional()
  bannerUrl?: string

  @ApiProperty({ description: 'Event is adult only', example: false })
  @IsBoolean()
  isAdultOnly: boolean

  @ApiProperty({ description: 'Event status', example: EventStatus.OPENED })
  @IsIn([EventStatus.DRAFT, EventStatus.OPENED])
  status: EventStatus
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}

class OrganizerInfoDto {
  @ApiProperty({ description: 'Organizer (user) ID', example: '123e4567-e89b-12d3-a456-4266141740423' })
  id: string

  @ApiProperty({ description: 'Organizer (user) name', example: 'John Doe' })
  name: string

  @ApiProperty({ description: 'Organizer (user) email', example: 'john.doe@example.com' })
  email: string

  @ApiProperty({ description: 'Organizer (user) avatar URL', example: 'https://example.com/avatar.png' })
  avatarUrl?: string
}

export class EventDataDto extends CreateEventDto {
  @ApiProperty({ description: 'Event ID', example: '123e4567-e89b-12d3-a456-426614174432' })
  id: string

  @ApiProperty({ description: 'Event changes ID', example: '123e4567-e89b-12d3-a456-426614174792' })
  eventChangesId?: string

  @ApiProperty({ description: 'Refund deadline', example: '2026-01-01T00:00:00.000Z' })
  changeRefundDeadline?: Date

  @ApiProperty({ description: 'Event creation date', example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date

  @ApiProperty({ description: 'Organizer (user) information', type: OrganizerInfoDto })
  organizer: OrganizerInfoDto
}

export class EventResponseDto {
  @ApiProperty({ description: 'Data of the event', example: EventDataDto })
  data: EventDataDto
}

export class QueryEventsDto extends QueryPaginationDto {
  @ApiProperty({ description: 'Search by title' })
  @IsString()
  @IsOptional()
  search?: string

  @ApiProperty({ description: 'Filter by state ID', example: 35, required: false })
  @IsInt()
  @IsOptional()
  stateId?: number

  @ApiProperty({ description: 'Filter by city ID', example: 35, required: false })
  @IsInt()
  @IsOptional()
  cityId?: number

  @ApiProperty({ description: 'Filter by category', example: EventCategory.MUSIC, required: false })
  @IsEnum(EventCategory)
  @IsOptional()
  category?: EventCategory

  @ApiProperty({ description: 'Filter by event start date', example: '2026-01-01T00:00:00.000Z', required: false })
  @IsDate()
  @IsOptional()
  startDate?: Date

  @ApiProperty({ description: 'Filter by event status', example: EventStatus.OPENED })
  @IsIn([EventStatus.OPENED, EventStatus.GOING, EventStatus.FINISHED])
  @IsLowercase()
  status: EventStatus

  @ApiProperty({ description: 'Filter by event is adult only', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isAdultOnly?: boolean
}

export class OrganizerQueryEventsDto extends QueryPaginationDto {
  @ApiProperty({ description: 'Search by title' })
  @IsString()
  @IsOptional()
  search?: string

  @ApiProperty({ description: 'Filter by state ID', example: 35, required: false })
  @IsInt()
  @IsOptional()
  stateId?: number

  @ApiProperty({ description: 'Filter by city ID', example: 35, required: false })
  @IsInt()
  @IsOptional()
  cityId?: number

  @ApiProperty({ description: 'Filter by category', example: EventCategory.MUSIC, required: false })
  @IsEnum(EventCategory)
  @IsOptional()
  category?: EventCategory

  @ApiProperty({ description: 'Filter by event start date', example: '2026-01-01T00:00:00.000Z', required: false })
  @IsDate()
  @IsOptional()
  startDate?: Date

  @ApiProperty({ description: 'Filter by event status', example: EventStatus.DRAFT })
  @IsEnum(EventStatus)
  @IsLowercase()
  status: EventStatus

  @ApiProperty({ description: 'Filter by event is adult only', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isAdultOnly?: boolean
}

export class ListEventsDto {
  @ApiProperty({ description: 'Event ID', example: '123e4567-e89b-12d3-a456-426614174432' })
  id: string

  @ApiProperty({ description: 'Event title', example: 'Event Title' })
  title: string

  @ApiProperty({ description: 'Maximum number of participants', example: 100 })
  maxParticipants: number

  @ApiProperty({ description: 'City and state name', example: 'Jaú' })
  cityName: string

  @ApiProperty({ description: 'State acronym', example: 'SP' })
  stateAcronym: string

  @ApiProperty({
    description: 'All info about the location',
    example: 'Zézinho Magalhães Stadium, Rua Zézinho Magalhães, 123, Vila XV',
  })
  locationName: string

  @ApiProperty({ description: 'Event start date', example: '2026-01-01T00:00:00.000Z' })
  startDate: Date

  @ApiProperty({ description: 'Event end date', example: '2026-01-01T00:00:00.000Z' })
  endDate: Date

  @ApiProperty({ description: 'Event category', example: EventCategory.MUSIC })
  category: EventCategory

  @ApiProperty({ description: 'Event is adult only', example: false })
  isAdultOnly: boolean

  @ApiProperty({ description: 'Event status', example: EventStatus.OPENED })
  status: EventStatus

  @ApiProperty({ description: 'Organizer (user) information', type: OrganizerInfoDto })
  organizer: OrganizerInfoDto
}

export class PaginateEventsDto {
  @ApiProperty({ description: 'List of events', type: [ListEventsDto] })
  data: ListEventsDto[]

  @ApiProperty({ description: 'Pagination meta', type: PaginationMetaDto })
  meta: PaginationMetaDto
}
