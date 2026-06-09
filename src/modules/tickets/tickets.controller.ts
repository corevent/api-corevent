import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import type { AuthenticatedRequest } from '~/common/interfaces/req.interface'
import { CheckinDto, CheckinResponseDto } from '~/modules/tickets/dto/tickets.dto'
import { TicketsService } from '~/modules/tickets/tickets.service'

@ApiTags('Events - Tickets')
@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post(':eventId/checkin')
  @ApiOperation({ summary: 'Check in a ticket by QR code' })
  @ApiParam({ name: 'eventId', type: String, description: 'The ID of the event' })
  @ApiBody({ type: CheckinDto })
  @ApiResponse({ status: 200, type: CheckinResponseDto })
  async checkin(
    @Req() req: AuthenticatedRequest,
    @Param('eventId') eventId: string,
    @Body() body: CheckinDto,
  ): Promise<CheckinResponseDto> {
    return this.ticketsService.checkin(req.user.id, eventId, body.qrToken)
  }
}
