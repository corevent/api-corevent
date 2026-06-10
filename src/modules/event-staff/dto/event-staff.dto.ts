import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsEnum, IsLowercase, IsOptional, IsString } from 'class-validator'
import { PaginationMetaDto, QueryPaginationDto } from '~/common/pagination/pagination.dto'
import {
  EventStaffAccessLevel,
  EventStaffInvitationStatus,
} from '~/modules/event-staff-invitations/enums/event-staff-invitation.enums'

export class EventStaffDataDto {
  @ApiProperty({ description: 'Event staff ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string

  @ApiProperty({ description: 'Access level', example: EventStaffAccessLevel.READONLY })
  accessLevel: EventStaffAccessLevel

  @ApiProperty({ description: 'Invitation status', example: EventStaffInvitationStatus.PENDING })
  invitationStatus: EventStaffInvitationStatus

  @ApiProperty({ description: 'Staff invitation ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  staffInvitationId: string

  @ApiProperty({ description: 'Created at', example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date
}

export class EventStaffResponseDto {
  @ApiProperty({ description: 'Event staff data', type: EventStaffDataDto })
  data: EventStaffDataDto
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

class EventStaffWithoutUserIdDto extends OmitType(EventStaffDataDto, ['userId']) {}

export class ListEventStaffDto extends EventStaffWithoutUserIdDto {
  @ApiProperty({ description: 'User information', type: UserInfoDto })
  user: UserInfoDto
}

export class PaginateEventStaffDto {
  @ApiProperty({ description: 'List of event staff', type: [ListEventStaffDto] })
  data: ListEventStaffDto[]

  @ApiProperty({ description: 'Pagination meta', type: PaginationMetaDto })
  meta: PaginationMetaDto
}

export class QueryEventStaffDto extends QueryPaginationDto {
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
  @IsOptional()
  invitationStatus?: EventStaffInvitationStatus

  @ApiProperty({
    description: 'Filter by access level',
    example: EventStaffAccessLevel.READONLY,
    required: false,
  })
  @IsEnum(EventStaffAccessLevel)
  @IsLowercase()
  @IsOptional()
  accessLevel?: EventStaffAccessLevel
}

export class UpdateAccessLevelDto {
  @ApiProperty({ description: 'Access level', example: EventStaffAccessLevel.CHECKIN })
  @IsEnum(EventStaffAccessLevel)
  @IsLowercase()
  accessLevel: EventStaffAccessLevel
}
