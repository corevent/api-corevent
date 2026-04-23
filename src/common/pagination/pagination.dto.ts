import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page', example: 1 })
  @Type(() => Number)
  currentPage: number

  @ApiProperty({ description: 'Items per page', example: 20 })
  @Type(() => Number)
  itemsPerPage: number

  @ApiProperty({ description: 'Total of items', example: 1000 })
  @Type(() => Number)
  totalItems: number

  @ApiProperty({ description: 'Total of pages', example: 50 })
  @Type(() => Number)
  totalPages: number
}
