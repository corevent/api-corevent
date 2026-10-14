import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import type { Pagination } from '~/common/pagination/pagination.interface'

@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(value: unknown): Pagination {
    if (!this.isObject(value)) {
      throw new BadRequestException('Pagination query must be an object')
    }

    if (!('currentPage' in value) || !('itemsPerPage' in value)) {
      throw new BadRequestException('Pagination must include currentPage and itemsPerPage')
    }

    const currentPage = this.toPositiveInteger(value.currentPage, 'currentPage')
    const itemsPerPage = this.toPositiveInteger(value.itemsPerPage, 'itemsPerPage')

    return { currentPage, itemsPerPage }
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
  }

  private toPositiveInteger(value: unknown, field: string): number {
    const parsedValue = typeof value === 'number' ? value : Number(value)

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      throw new BadRequestException(`${field} must be a positive integer`)
    }

    return parsedValue
  }
}
