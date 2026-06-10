import { ApiProperty } from '@nestjs/swagger'

export class AgePolicyAcceptanceDataDto {
  @ApiProperty({ description: 'The ID of the age policy acceptance', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'The ID of the user', example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string

  @ApiProperty({ description: 'The ID of the age policy', example: '123e4567-e89b-12d3-a456-426614174000' })
  agePolicyId: string

  @ApiProperty({ description: 'The created at', example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date
}

export class AgePolicyAcceptanceResponseDto {
  @ApiProperty({ description: 'The data of the age policy acceptance', type: AgePolicyAcceptanceDataDto })
  data: AgePolicyAcceptanceDataDto
}

export class CheckIfUserHasAcceptedDto {
  @ApiProperty({ description: 'Whether the user has accepted the age policy', example: true })
  userHasAccepted: boolean
}

export class CheckIfUserHasAcceptedResponseDto {
  @ApiProperty({ description: 'The data of the check if user has accepted', type: CheckIfUserHasAcceptedDto })
  data: CheckIfUserHasAcceptedDto
}
