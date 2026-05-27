import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Tickets } from '~/modules/tickets/tickets.entity'

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Tickets)
    private ticketsRepository: Repository<Tickets>,
  ) {}
}
