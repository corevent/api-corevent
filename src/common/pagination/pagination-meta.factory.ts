import { BadRequestException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { PaginationMetaDto } from '~/common/pagination/pagination.dto'

export function createPaginationMeta(page: number, limit: number, totalItems: number): PaginationMetaDto {
  const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0

  if (page > totalPages) {
    throw new BadRequestException('Page number is out of range')
  }

  return plainToInstance(PaginationMetaDto, {
    currentPage: page,
    itemsPerPage: limit,
    totalItems,
    totalPages,
  })
}
