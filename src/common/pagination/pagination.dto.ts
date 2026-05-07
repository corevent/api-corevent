import { ApiProperty } from '@nestjs/swagger'
import { IsInt, Max, Min } from 'class-validator'

export class QueryPaginationDto {
  @ApiProperty({ description: 'Page number', example: 1, required: true })
  @IsInt()
  @Min(1)
  page: number

  @ApiProperty({ description: 'Limit of items per page', example: 10, required: true })
  @IsInt()
  @Min(10)
  @Max(100)
  limit: number
}

export class PaginationMetaDto extends QueryPaginationDto {
  @ApiProperty({ description: 'Total of items', example: 1000, required: true })
  totalItems: number

  @ApiProperty({ description: 'Total of pages', example: 50, required: true })
  totalPages: number
}
