import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Max, Min } from 'class-validator'

export class QueryPaginationDto {
  @ApiProperty({ description: 'Page number', type: Number, example: 1, minimum: 1, required: true })
  @IsInt()
  @Min(1)
  page!: number

  @ApiProperty({
    description: 'Limit of items per page',
    type: Number,
    example: 10,
    minimum: 10,
    maximum: 100,
    required: true,
  })
  @IsInt()
  @Min(10)
  @Max(100)
  limit!: number
}

export class PaginationMetaDto extends QueryPaginationDto {
  @ApiProperty({ description: 'Total of items', type: Number, example: 1000, required: true })
  totalItems!: number

  @ApiProperty({ description: 'Total of pages', type: Number, example: 50, required: true })
  totalPages!: number
}
