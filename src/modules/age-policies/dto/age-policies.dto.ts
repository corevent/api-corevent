import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class AgePolicyDataDto {
  @ApiProperty({ description: 'Age policy ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'Age policy description', example: 'Age policy description' })
  description: string

  @ApiProperty({ description: 'Age policy version', example: 1 })
  @Type(() => Number)
  version: number

  @ApiProperty({ description: 'Age policy is active', example: true })
  isActive: boolean
}

export class AgePolicyResponseDto {
  @ApiProperty({ description: 'Age policy data', type: AgePolicyDataDto })
  data: AgePolicyDataDto
}
