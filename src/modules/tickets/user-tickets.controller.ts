import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { PaginateMyTicketsDto, QueryMyTicketsDto } from '~/modules/tickets/dto/tickets.dto'
import { TicketsService } from '~/modules/tickets/tickets.service'

@ApiTags('Users - Tickets')
@UseGuards(AuthGuard('jwt'))
@Controller('users/me')
export class UserTicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('tickets')
  @ApiOperation({ summary: 'Get my tickets' })
  @ApiQuery({ type: QueryMyTicketsDto })
  @ApiResponse({ status: 200, type: PaginateMyTicketsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyTickets(
    @Req() req: AuthenticatedRequest,
    @Query() query: QueryMyTicketsDto,
  ): Promise<PaginateMyTicketsDto> {
    return this.ticketsService.getMyTickets(req.user.id, query)
  }
}
