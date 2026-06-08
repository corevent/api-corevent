import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { plainToInstance } from 'class-transformer'
import { Repository } from 'typeorm'
import {
  CreateEventRatingDto,
  EventRatingDataDto,
  EventRatingResponseDto,
} from '~/modules/event-ratings/dto/event-ratings.dto'
import { EventRatings } from '~/modules/event-ratings/event-ratings.entity'

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
}
