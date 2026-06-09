import { Controller, Headers, HttpCode, Post, Req, UnauthorizedException, type RawBodyRequest } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { PagBankWebhookService } from '~/modules/pagbank/pagbank-webhook.service'

@ApiTags('PagBank')
@Controller('pagbank')
export class PagBankController {
  constructor(private readonly pagBankWebhookService: PagBankWebhookService) {}

  @Post('webhooks')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive PagBank payment notifications' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid webhook signature.' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-authenticity-token') authenticityToken: string | undefined,
  ): Promise<void> {
    const rawBody = req.rawBody?.toString('utf8')

    if (!rawBody) {
      throw new UnauthorizedException('Missing webhook payload')
    }

    await this.pagBankWebhookService.handleWebhook(rawBody, authenticityToken)
  }
}
