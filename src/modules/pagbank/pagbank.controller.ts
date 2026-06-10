import {
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  type RawBodyRequest,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { PagBankWebhookService } from '~/modules/pagbank/pagbank-webhook.service'

@ApiTags('PagBank')
@Controller('pagbank')
export class PagBankController {
  private readonly logger = new Logger(PagBankController.name)

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

    this.logger.log(
      [
        'Webhook received',
        `hasRawBody=${Boolean(rawBody)}`,
        `rawBodyLength=${rawBody?.length ?? 0}`,
        `hasAuthenticityToken=${Boolean(authenticityToken)}`,
      ].join(' '),
    )

    if (!rawBody) {
      this.logger.warn('Webhook rejected: missing raw body')
      throw new UnauthorizedException('Missing webhook payload')
    }

    await this.pagBankWebhookService.handleWebhook(rawBody, authenticityToken)
    this.logger.log('Webhook processed successfully')
  }
}
