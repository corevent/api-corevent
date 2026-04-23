import { BadRequestException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { PaginationMetaDto } from '~/common/pagination/pagination.dto'

export function createPaginationMeta(currentPage: number, itemsPerPage: number, totalItems: number): PaginationMetaDto {
  const totalPages = itemsPerPage > 0 ? Math.ceil(totalItems / itemsPerPage) : 0

  if (currentPage > totalPages) {
    throw new BadRequestException('Page number is out of range')
  }

  return plainToInstance(PaginationMetaDto, {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
  })
}
