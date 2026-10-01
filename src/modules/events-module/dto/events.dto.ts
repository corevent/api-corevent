import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger'
import {
  IsBoolean,
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
import { IsStrictDate } from '~/common/decorators/is-strict-date.decorator'
import { PaginationMetaDto, QueryPaginationDto } from '~/common/pagination/pagination.dto'
import { EventCategory, EventLocationType, EventStatus } from '~/modules/events-module/events.entity'
import { EventStaffAccessLevel } from '~/modules/event-staff-invitations/enums/event-staff-invitation.enums'

export class CreateEventDto {
  @ApiProperty({ description: 'Title of the event', type: String, example: 'Event Title' })
  @IsString()
  @IsNotEmpty()
  title!: string

  @ApiProperty({
    description: 'Description of the event',
    type: String,
    example: 'Event Description',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string

  @ApiProperty({ description: 'Maximum number of participants', type: Number, example: 100 })
  @IsInt()
  maxParticipants!: number

  @ApiProperty({
    description: 'Location type. Note: if the location type is not online, the address fields are required',
    enum: EventLocationType,
    example: EventLocationType.IN_PERSON,
  })
  @IsEnum(EventLocationType)
  locationType!: EventLocationType

  @ApiProperty({
    description: 'Location name',
    type: String,
    example: 'Zézinho Magalhães Stadium',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  locationName?: string

  @ApiProperty({ description: 'City ID of the event', type: Number, example: 3525300, minimum: 1, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  cityId?: number

  @ApiProperty({
    description: 'Address zip code',
    type: String,
    example: '12345678',
    minLength: 8,
    maxLength: 8,
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  @IsOptional()
  zipCode?: string

  @ApiProperty({ description: 'Address neighborhood', type: String, example: 'Neighborhood', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  neighborhood?: string

  @ApiProperty({ description: 'Address street', type: String, example: 'Street', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  street?: string

  @ApiProperty({ description: 'Address number', type: Number, example: 123, minimum: 1, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  number?: number

  @ApiProperty({ description: 'Address complement', type: String, example: 'Complement', required: false })
  @IsString()
  @IsOptional()
  complement?: string

  @ApiProperty({
    description: 'Event start date',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsStrictDate()
  startDate!: Date

  @ApiProperty({
    description: 'Event end date',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsStrictDate()
  endDate!: Date

  @ApiProperty({ description: 'Event category', enum: EventCategory, example: EventCategory.MUSIC })
  @IsEnum(EventCategory)
  category!: EventCategory

  @ApiProperty({ description: 'Event is adult only', type: Boolean, example: false })
  @IsBoolean()
  isAdultOnly!: boolean

  @ApiProperty({
    description: 'Event status',
    enum: [EventStatus.DRAFT, EventStatus.OPENED],
    example: EventStatus.OPENED,
  })
  @IsIn([EventStatus.DRAFT, EventStatus.OPENED])
  status!: EventStatus
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}

class OrganizerInfoDto {
  @ApiProperty({
    description: 'Organizer (user) ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-4266141740423',
  })
  id!: string

  @ApiProperty({ description: 'Organizer (user) name', type: String, example: 'John Doe' })
  name!: string

  @ApiProperty({
    description: 'Organizer (user) email',
    type: String,
    format: 'email',
    example: 'john.doe@example.com',
  })
  email!: string

  @ApiProperty({
    description: 'Organizer (user) avatar URL',
    type: String,
    example: 'https://example.com/avatar.png',
    required: false,
  })
  avatarUrl?: string
}

class StateInfoDto {
  @ApiProperty({ description: 'State ID', type: Number, example: 35 })
  id!: number

  @ApiProperty({ description: 'State name', type: String, example: 'São Paulo' })
  name!: string

  @ApiProperty({ description: 'State acronym', type: String, example: 'SP' })
  acronym!: string
}

class CityInfoDto {
  @ApiProperty({ description: 'City ID', type: Number, example: 3525300 })
  id!: number

  @ApiProperty({ description: 'City name', type: String, example: 'Jaú' })
  name!: string

  @ApiProperty({ description: 'State information', type: StateInfoDto })
  state!: StateInfoDto
}

export class EventDataDto extends OmitType(CreateEventDto, ['cityId']) {
  @ApiProperty({
    description: 'Event ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174432',
  })
  id!: string

  @ApiProperty({
    description: 'Event changes ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174792',
    required: false,
  })
  eventChangesId?: string

  @ApiProperty({
    description: 'Refund deadline',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
    required: false,
  })
  changeRefundDeadline?: Date

  @ApiProperty({
    description: 'Event creation date',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
  })
  createdAt!: Date

  @ApiProperty({ description: 'Organizer (user) information', type: OrganizerInfoDto })
  organizer!: OrganizerInfoDto

  @ApiProperty({ description: 'City information', type: CityInfoDto })
  city!: CityInfoDto

  @ApiProperty({ description: 'Average event rating', type: Number, example: 4.5, required: false })
  averageRating?: number
}

export class EventResponseDto {
  @ApiProperty({ description: 'Data of the event', type: EventDataDto })
  data!: EventDataDto
}

export class QueryEventsDto extends QueryPaginationDto {
  @ApiProperty({ description: 'Search by title', type: String, example: 'Evento Legal', required: false })
  @IsString()
  @IsOptional()
  search?: string

  @ApiProperty({ description: 'Filter by state ID', type: Number, example: 35, required: false })
  @IsInt()
  @IsOptional()
  stateId?: number

  @ApiProperty({ description: 'Filter by city ID', type: Number, example: 35, required: false })
  @IsInt()
  @IsOptional()
  cityId?: number

  @ApiProperty({
    description: 'Filter by category',
    enum: EventCategory,
    example: EventCategory.MUSIC,
    required: false,
  })
  @IsEnum(EventCategory)
  @IsOptional()
  category?: EventCategory

  @ApiProperty({
    description: 'Filter by event start date',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
    required: false,
  })
  @IsStrictDate()
  @IsOptional()
  startDate?: Date

  @ApiProperty({
    description: 'Filter by event status',
    enum: [EventStatus.OPENED, EventStatus.GOING, EventStatus.FINISHED],
    example: EventStatus.OPENED,
  })
  @IsIn([EventStatus.OPENED, EventStatus.GOING, EventStatus.FINISHED])
  @IsLowercase()
  status!: EventStatus

  @ApiProperty({ description: 'Filter by event is adult only', type: Boolean, example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isAdultOnly?: boolean
}

export class OrganizerQueryEventsDto extends QueryPaginationDto {
  @ApiProperty({ description: 'Search by title', type: String, required: false })
  @IsString()
  @IsOptional()
  search?: string

  @ApiProperty({ description: 'Filter by state ID', type: Number, example: 35, required: false })
  @IsInt()
  @IsOptional()
  stateId?: number

  @ApiProperty({ description: 'Filter by city ID', type: Number, example: 35, required: false })
  @IsInt()
  @IsOptional()
  cityId?: number

  @ApiProperty({
    description: 'Filter by category',
    enum: EventCategory,
    example: EventCategory.MUSIC,
    required: false,
  })
  @IsEnum(EventCategory)
  @IsOptional()
  category?: EventCategory

  @ApiProperty({
    description: 'Filter by event start date',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
    required: false,
  })
  @IsStrictDate()
  @IsOptional()
  startDate?: Date

  @ApiProperty({ description: 'Filter by event status', enum: EventStatus, example: EventStatus.DRAFT })
  @IsEnum(EventStatus)
  @IsLowercase()
  status!: EventStatus

  @ApiProperty({ description: 'Filter by event is adult only', type: Boolean, example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isAdultOnly?: boolean
}

export class ListEventsDto {
  @ApiProperty({
    description: 'Event ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174432',
  })
  id!: string

  @ApiProperty({ description: 'Event title', type: String, example: 'Event Title' })
  title!: string

  @ApiProperty({ description: 'Maximum number of participants', type: Number, example: 100 })
  maxParticipants!: number

  @ApiProperty({ description: 'City and state name', type: String, example: 'Jaú' })
  cityName!: string

  @ApiProperty({ description: 'State acronym', type: String, example: 'SP' })
  stateAcronym!: string

  @ApiProperty({
    description: 'All info about the location',
    type: String,
    example: 'Zézinho Magalhães Stadium, Rua Zézinho Magalhães, 123, Vila XV',
  })
  locationName!: string

  @ApiProperty({
    description: 'Event start date',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
  })
  startDate!: Date

  @ApiProperty({
    description: 'Event end date',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
  })
  endDate!: Date

  @ApiProperty({ description: 'Event category', enum: EventCategory, example: EventCategory.MUSIC })
  category!: EventCategory

  @ApiProperty({
    description: 'Event banner URL',
    type: String,
    example: 'https://example.com/banner.jpg',
    required: false,
  })
  bannerUrl?: string

  @ApiProperty({ description: 'Event is adult only', type: Boolean, example: false })
  isAdultOnly!: boolean

  @ApiProperty({ description: 'Event status', enum: EventStatus, example: EventStatus.OPENED })
  status!: EventStatus

  @ApiProperty({ description: 'Location type', enum: EventLocationType, example: EventLocationType.IN_PERSON })
  locationType!: EventLocationType

  @ApiProperty({ description: 'Organizer (user) information', type: OrganizerInfoDto })
  organizer!: OrganizerInfoDto

  @ApiProperty({ description: 'Average event rating', type: Number, example: 4.5, required: false })
  averageRating?: number

  @ApiProperty({
    description: 'Staff access level',
    enum: EventStaffAccessLevel,
    required: false,
  })
  accessLevel?: EventStaffAccessLevel

  @ApiProperty({
    description: 'Favorite ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  favoriteId?: string
}

export class PaginateEventsDto {
  @ApiProperty({ description: 'List of events', type: [ListEventsDto] })
  data!: ListEventsDto[]

  @ApiProperty({ description: 'Pagination meta', type: PaginationMetaDto })
  meta!: PaginationMetaDto
}
