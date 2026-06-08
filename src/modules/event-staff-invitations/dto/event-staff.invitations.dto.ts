import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsLowercase, IsOptional, IsString } from 'class-validator'
import { PaginationMetaDto, QueryPaginationDto } from '~/common/pagination/pagination.dto'
import {
  EventStaffAccessLevel,
  EventStaffInvitationStatus,
} from '~/modules/event-staff-invitations/event-staff-invitations.entity'

export class CreateEventStaffInvitationDto {
  @ApiProperty({ description: 'User email', example: 'john.doe@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ description: 'Access level', example: EventStaffAccessLevel.READONLY })
  @IsEnum(EventStaffAccessLevel)
  originalAccessLevel: EventStaffAccessLevel
}

export class EventStaffInvitationDataDto extends CreateEventStaffInvitationDto {
  @ApiProperty({ description: 'Event staff invitation ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string

  @ApiProperty({ description: 'Event ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  eventId: string

  @ApiProperty({ description: 'Invitation status', example: EventStaffInvitationStatus.PENDING })
  invitationStatus: EventStaffInvitationStatus

  @ApiProperty({ description: 'Created at', example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date
}

export class EventStaffInvitationResponseDto {
  @ApiProperty({ description: 'Event staff invitation data', type: EventStaffInvitationDataDto })
  data: EventStaffInvitationDataDto
}

export class QueryEventStaffInvitationsDto extends QueryPaginationDto {
  @ApiProperty({ description: 'Search by user name', example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string

  // the decorator @IsEmail is not needed beacuse the search can be only the beginning of the email (e.g. john@)
  @ApiProperty({ description: 'Search by user email', example: 'john.doe@example.com', required: false })
  @IsString()
  @IsOptional()
  email?: string

  @ApiProperty({
    description: 'Filter by invitation status',
    example: EventStaffInvitationStatus.PENDING,
    required: false,
  })
  @IsEnum(EventStaffInvitationStatus)
  invitationStatus: EventStaffInvitationStatus

  @ApiProperty({
    description: 'Filter by original access level',
    example: EventStaffAccessLevel.READONLY,
    required: false,
  })
  @IsEnum(EventStaffAccessLevel)
  @IsLowercase()
  @IsOptional()
  originalAccessLevel?: EventStaffAccessLevel
}

class UserInfoDto {
  @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string

  @ApiProperty({ description: 'User email', example: 'john.doe@example.com' })
  email: string

  @ApiProperty({ description: 'User avatar URL', example: 'https://example.com/avatar.png' })
  avatarUrl?: string
}

export class ListEventStaffInvitationsDto extends EventStaffInvitationDataDto {
  @ApiProperty({ description: 'User information', type: UserInfoDto })
  user: UserInfoDto
}

class EventInfoDto {
  @ApiProperty({ description: 'Event ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'Event title', example: 'Event Title' })
  title: string
}

export class ListEventStaffInvitationsWithOrganizerDto extends EventStaffInvitationDataDto {
  @ApiProperty({ description: 'Event information', type: EventInfoDto })
  event: EventInfoDto

  @ApiProperty({ description: 'Organizer information', type: UserInfoDto })
  organizer: UserInfoDto
}

export class PaginateEventStaffInvitationsDto {
  @ApiProperty({ description: 'List of event staff invitations', type: [ListEventStaffInvitationsDto] })
  data: ListEventStaffInvitationsDto[]

  @ApiProperty({ description: 'Pagination meta', type: PaginationMetaDto })
  meta: PaginationMetaDto
}

export class PaginateEventStaffInvitationsWithOrganizerDto {
  @ApiProperty({ description: 'List of event staff invitations', type: [ListEventStaffInvitationsWithOrganizerDto] })
  data: ListEventStaffInvitationsWithOrganizerDto[]

  @ApiProperty({ description: 'Pagination meta', type: PaginationMetaDto })
  meta: PaginationMetaDto
}
