import { Controller } from '@nestjs/common'
import { TicketsService } from '~/modules/tickets/tickets.service'

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}
}
