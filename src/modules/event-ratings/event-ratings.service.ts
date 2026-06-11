import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import { createPaginationMeta } from '~/common/pagination/pagination-meta.factory'
import { getOffset } from '~/common/utils/get-offset.util'
import {
  CreateEventRatingDto,
  EventRatingDataDto,
  EventRatingResponseDto,
  MyEventRatingDto,
  PaginateMyEventRatingsDto,
  QueryMyEventRatingsDto,
} from '~/modules/event-ratings/dto/event-ratings.dto'
import { EventRatings } from '~/modules/event-ratings/event-ratings.entity'

interface MyEventRatingRawRow {
  eventId: string
  eventTitle: string
  bannerUrl: string | null
  userRating: string
  averageRating: string | null
}

@Injectable()
export class EventRatingsService {
  constructor(
    @InjectRepository(EventRatings)
    private eventRatingsRepository: Repository<EventRatings>,
  ) {}

  async create(userId: string, eventId: string, body: CreateEventRatingDto): Promise<EventRatingResponseDto> {
    await this.checkIfRatingExists(userId, eventId)
    const eventRating = this.eventRatingsRepository.create({ userId, eventId, ...body })
    const data = await this.eventRatingsRepository.save(eventRating)
    return { data: plainToInstance(EventRatingDataDto, data) }
  }

  async update(userId: string, eventRatingId: string, body: CreateEventRatingDto): Promise<EventRatingResponseDto> {
    await this.eventRatingsRepository.update({ userId, id: eventRatingId }, body)
    return this.getById(userId, eventRatingId)
  }

  async remove(userId: string, eventRatingId: string): Promise<void> {
    const { affected } = await this.eventRatingsRepository.delete({ userId, id: eventRatingId })
    if (affected === 0) {
      throw new NotFoundException('Event rating not found')
    }
  }

  async getMyRatings(userId: string, queryParams: QueryMyEventRatingsDto): Promise<PaginateMyEventRatingsDto> {
    const { page, limit } = queryParams
    const total = await this.eventRatingsRepository.count({ where: { userId } })

    const rows = await this.eventRatingsRepository
      .createQueryBuilder('er')
      .innerJoin('er.event', 'e')
      .select('e.id', 'eventId')
      .addSelect('e.title', 'eventTitle')
      .addSelect('e.bannerUrl', 'bannerUrl')
      .addSelect('er.rating', 'userRating')
      .addSelect((subQuery) => {
        return subQuery
          .select('AVG(eventRating.rating)', 'averageRating')
          .from(EventRatings, 'eventRating')
          .where('eventRating.eventId = e.id')
      }, 'averageRating')
      .where('er.userId = :userId', { userId })
      .orderBy('er.createdAt', 'DESC')
      .offset(getOffset(page, limit))
      .limit(limit)
      .getRawMany<MyEventRatingRawRow>()

    return {
      data: rows.map((row) => this.mapMyEventRating(row)),
      meta: createPaginationMeta(page, limit, total),
    }
  }

  private async getById(userId: string, eventRatingId: string): Promise<EventRatingResponseDto> {
    const eventRating = await this.eventRatingsRepository.findOne({ where: { userId, id: eventRatingId } })
    if (!eventRating) {
      throw new NotFoundException('Event rating not found')
    }
    return { data: plainToInstance(EventRatingDataDto, eventRating) }
  }

  private async checkIfRatingExists(userId: string, eventId: string): Promise<void> {
    const rating = await this.eventRatingsRepository.findOne({ where: { userId, eventId } })
    if (rating) {
      throw new BadRequestException('You have already rated this event')
    }
  }

  private mapMyEventRating(row: MyEventRatingRawRow): MyEventRatingDto {
    return plainToInstance(MyEventRatingDto, {
      eventId: row.eventId,
      eventTitle: row.eventTitle,
      bannerUrl: row.bannerUrl ?? undefined,
      userRating: Number(row.userRating),
      averageRating: Number(row.averageRating),
    })
  }
}
