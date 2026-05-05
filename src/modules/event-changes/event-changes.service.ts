import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateEventChangeDto } from '~/modules/event-changes/dto/event-changes.dto'
import { EventChanges } from '~/modules/event-changes/event-changes.entity'

@Injectable()
export class EventChangesService {
  constructor(
    @InjectRepository(EventChanges)
    private eventChangesRepository: Repository<EventChanges>,
  ) {}

  async create(changedByUserId: string, eventId: string, body: CreateEventChangeDto): Promise<EventChanges> {
    const eventChange = this.eventChangesRepository.create({
      changedByUserId,
      eventId,
      ...body,
    })

    return this.eventChangesRepository.save(eventChange)
  }
}
