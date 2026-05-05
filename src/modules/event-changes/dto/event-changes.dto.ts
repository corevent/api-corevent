import { ApiProperty } from '@nestjs/swagger'
import { IsJSON } from 'class-validator'

export class CreateEventChangeDto {
  @ApiProperty({ description: 'Fields that was changed', example: ['startDate', 'endDate'] })
  changedFields: string[]

  @ApiProperty({ description: 'Old value of the field', example: '2026-01-01T00:00:00.000Z' })
  @IsJSON()
  oldValue: Record<string, any>

  @ApiProperty({ description: 'New value of the field', example: '2026-01-01T00:00:00.000Z' })
  @IsJSON()
  newValue: Record<string, any>
}
