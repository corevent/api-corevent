import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, Max, Min } from 'class-validator'
import { PaginationMetaDto, QueryPaginationDto } from '~/common/pagination/pagination.dto'

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

export class MyEventRatingDto {
  @ApiProperty({ description: 'Event ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  eventId: string

  @ApiProperty({ description: 'Event title', example: 'Summer Music Festival' })
  eventTitle: string

  @ApiPropertyOptional({ description: 'Event banner URL', example: 'https://example.com/banner.jpg' })
  bannerUrl?: string

  @ApiProperty({ description: 'Average event rating', example: 4.5 })
  averageRating: number

  @ApiProperty({ description: 'Current user rating for this event', example: 5 })
  userRating: number
}

export class PaginateMyEventRatingsDto {
  @ApiProperty({ description: 'List of event ratings by the current user', type: [MyEventRatingDto] })
  @Type(() => MyEventRatingDto)
  data: MyEventRatingDto[]

  @ApiProperty({ description: 'Pagination meta', type: PaginationMetaDto })
  @Type(() => PaginationMetaDto)
  meta: PaginationMetaDto
}

export class QueryMyEventRatingsDto extends QueryPaginationDto {}
