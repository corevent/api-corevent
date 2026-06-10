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
    @Headers('x-payload-signature') payloadSignature: string | undefined,
  ): Promise<void> {
    const rawBody = req.rawBody?.toString('utf8')
    const headerNames = Object.keys(req.headers).sort().join(', ')

    this.logger.log(
      [
        'Webhook received',
        `hasRawBody=${Boolean(rawBody)}`,
        `rawBodyLength=${rawBody?.length ?? 0}`,
        `hasAuthenticityToken=${Boolean(authenticityToken)}`,
        `authenticityTokenLength=${authenticityToken?.length ?? 0}`,
        `hasPayloadSignature=${Boolean(payloadSignature)}`,
        `payloadSignatureLength=${payloadSignature?.length ?? 0}`,
        `headerNames=[${headerNames}]`,
      ].join(' '),
    )

    if (!rawBody) {
      this.logger.warn('Webhook rejected: missing raw body')
      throw new UnauthorizedException('Missing webhook payload')
    }

    await this.pagBankWebhookService.handleWebhook(rawBody)
    this.logger.log('Webhook processed successfully')
  }
}
