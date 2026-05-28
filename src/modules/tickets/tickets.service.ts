import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateTicket } from '~/modules/tickets/interfaces/tickets.interface'
import { Tickets } from '~/modules/tickets/tickets.entity'

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Tickets)
    private ticketsRepository: Repository<Tickets>,
  ) {}

  async createTicket(body: CreateTicket): Promise<Tickets> {
    const ticket = this.ticketsRepository.create(body)
    return this.ticketsRepository.save(ticket)
  }
}
