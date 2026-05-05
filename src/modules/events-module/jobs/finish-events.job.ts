import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThan, Repository } from 'typeorm'
import { Events, EventStatus } from '~/modules/events-module/events.entity'

@Injectable()
export class EventsCronService {
  constructor(
    @InjectRepository(Events)
    private readonly eventsRepository: Repository<Events>,
  ) {}

  // Every minute, check if any event has started and set its status to going
  @Cron(CronExpression.EVERY_MINUTE)
  async handleStartEvents() {
    const now = new Date()

    await this.eventsRepository.update(
      {
        startDate: LessThan(now),
        status: EventStatus.PUBLISHED,
      },
      {
        status: EventStatus.GOING,
      },
    )
  }

  // Every minute, check if any event has ended and set its status to finished
  @Cron(CronExpression.EVERY_MINUTE)
  async handleFinishedEvents() {
    const now = new Date()

    await this.eventsRepository.update(
      {
        endDate: LessThan(now),
        status: EventStatus.GOING,
      },
      {
        status: EventStatus.FINISHED,
      },
    )
  }
}
