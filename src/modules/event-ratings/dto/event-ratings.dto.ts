import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Max, Min } from 'class-validator'

export class CreateEventRatingDto {
  @ApiProperty({ description: 'Rating', example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number
}

export class EventRatingDataDto {
  @ApiProperty({ description: 'Rating ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string

  @ApiProperty({ description: 'Event ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  eventId: string

  @ApiProperty({ description: 'Rating', example: 5 })
  rating: number

  @ApiProperty({ description: 'Created at', example: '2026-01-01T00:00:00.000Z' })
  createdAt: Date
}

export class EventRatingResponseDto {
  @ApiProperty({ description: 'Rating data', type: EventRatingDataDto })
  data: EventRatingDataDto
}
