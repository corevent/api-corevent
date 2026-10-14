import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { createPaginationMeta } from '~/common/pagination/pagination-meta.factory'
import { getOffset } from '~/common/utils/get-offset.util'
import { Attractions } from '~/modules/attractions/attractions.entity'
import {
  AttractionDataDto,
  AttractionListDto,
  AttractionResponseDto,
  CreateAttractionDto,
  PaginatedAttractionsDto,
  QueryAttractionsDto,
  UpdateAttractionDto,
} from '~/modules/attractions/dto/attractions.dto'

@Injectable()
export class AttractionsService {
  constructor(
    @InjectRepository(Attractions)
    private attractionsRepository: Repository<Attractions>,
  ) {}

  async create(eventId: string, body: CreateAttractionDto): Promise<AttractionResponseDto> {
    const attraction = this.attractionsRepository.create({ ...body, eventId })
    const data = await this.attractionsRepository.save(attraction)
    return { data: plainToInstance(AttractionDataDto, data) }
  }

  async update(attractionId: string, body: UpdateAttractionDto): Promise<AttractionResponseDto> {
    await this.attractionsRepository.update(attractionId, body)
    return this.getById(attractionId)
  }

  async getById(attractionId: string): Promise<AttractionResponseDto> {
    const attraction = await this.attractionsRepository.findOne({ where: { id: attractionId } })
    if (!attraction) {
      throw new NotFoundException('Attraction not found')
    }
    return { data: plainToInstance(AttractionDataDto, attraction) }
  }

  async getAll(eventId: string, queryParams: QueryAttractionsDto): Promise<PaginatedAttractionsDto> {
    const { page, limit, ...filters } = queryParams
    const query = this.attractionsRepository
      .createQueryBuilder('a')
      .where('a.eventId = :eventId', { eventId })
      .limit(limit)
      .offset(getOffset(page, limit))
      .orderBy('a.startDate', 'ASC')
    this.applyFilters(query, filters)
    this.applySearch(query, filters)

    const [list, total] = await query.getManyAndCount()
    return {
      data: plainToInstance(AttractionListDto, list),
      meta: createPaginationMeta(page, limit, total),
    }
  }

  async delete(attractionId: string): Promise<void> {
    await this.attractionsRepository.delete(attractionId)
  }

  private applyFilters(query: SelectQueryBuilder<Attractions>, filters: Partial<QueryAttractionsDto>) {
    const { startDate, endDate } = filters
    if (startDate) {
      query.andWhere('a.startDate = :startDate', { startDate })
    }
    if (endDate) {
      query.andWhere('a.endDate = :endDate', { endDate })
    }
  }

  private applySearch(query: SelectQueryBuilder<Attractions>, filters: Partial<QueryAttractionsDto>): void {
    const { search, guest } = filters
    if (search) {
      query.andWhere('unaccent(a.title) ILIKE unaccent(:search)', { search: `%${search}%` })
    }

    if (guest) {
      query.andWhere('a.guest = :guest', { guest })
    }
  }
}
