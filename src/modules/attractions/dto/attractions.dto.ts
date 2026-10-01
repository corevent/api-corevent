import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsOptional } from 'class-validator'
import { IsStrictDate } from '~/common/decorators/is-strict-date.decorator'
import { PaginationMetaDto, QueryPaginationDto } from '~/common/pagination/pagination.dto'

export class CreateAttractionDto {
  @ApiProperty({ description: 'Attraction title', type: String, example: 'Attraction Title' })
  @IsString()
  @IsNotEmpty()
  title!: string

  @ApiProperty({ description: 'Attraction guest', type: String, example: 'Attraction Guest' })
  @IsString()
  @IsNotEmpty()
  guest!: string

  @ApiProperty({
    description: 'Attraction start date',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsStrictDate()
  startDate!: Date

  @ApiProperty({
    description: 'Attraction end date',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsStrictDate()
  endDate!: Date
}

export class UpdateAttractionDto extends PartialType(CreateAttractionDto) {}

export class AttractionDataDto extends CreateAttractionDto {
  @ApiProperty({
    description: 'Attraction ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174432',
  })
  id!: string

  @ApiProperty({
    description: 'Event ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174432',
  })
  eventId!: string
}

export class AttractionResponseDto {
  @ApiProperty({ description: 'Data of the attraction', type: AttractionDataDto })
  data!: AttractionDataDto
}

export class AttractionListDto extends OmitType(AttractionDataDto, ['eventId']) {}

export class PaginatedAttractionsDto {
  @ApiProperty({ description: 'List of attractions', type: [AttractionListDto] })
  data!: AttractionListDto[]

  @ApiProperty({ description: 'Pagination meta', type: PaginationMetaDto })
  meta!: PaginationMetaDto
}

export class QueryAttractionsDto extends QueryPaginationDto {
  @ApiProperty({ description: 'Search by title', type: String, example: 'Attraction Title', required: false })
  @IsString()
  @IsOptional()
  search?: string

  @ApiProperty({ description: 'Filter by guest', type: String, example: 'Attraction Guest', required: false })
  @IsString()
  @IsOptional()
  guest?: string

  @ApiProperty({
    description: 'Filter by start date',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
    required: false,
  })
  @IsStrictDate()
  @IsOptional()
  startDate?: Date

  @ApiProperty({
    description: 'Filter by end date',
    type: String,
    format: 'date-time',
    example: '2026-01-01T00:00:00.000Z',
    required: false,
  })
  @IsStrictDate()
  @IsOptional()
  endDate?: Date
}
