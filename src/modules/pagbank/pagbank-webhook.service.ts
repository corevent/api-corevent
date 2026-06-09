import { Inject, Injectable, Logger, UnauthorizedException, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OrdersService } from '~/modules/orders/orders.service'
import { PagBankWebhookPayload } from '~/modules/pagbank/interface/pagbank.interface'
import { validateWebhookSignature } from '~/modules/pagbank/utils/validate-webhook-signature.util'

@Injectable()
export class PagBankWebhookService {
  private readonly logger = new Logger(PagBankWebhookService.name)

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  async handleWebhook(rawBody: string, authenticityToken: string | undefined): Promise<void> {
    this.validateAuthenticity(rawBody, authenticityToken)

    const payload = JSON.parse(rawBody) as PagBankWebhookPayload
    const isPaid = payload.charges?.some((charge) => charge.status === 'PAID') ?? false

    if (!isPaid) {
      return
    }

    const checkoutId = payload.id.startsWith('CHEC_') ? payload.id : null
    const referenceId = payload.reference_id ?? null

    await this.ordersService.markAsPaidFromWebhook(checkoutId, referenceId)
  }

  private validateAuthenticity(rawBody: string, authenticityToken: string | undefined): void {
    if (!authenticityToken) {
      throw new UnauthorizedException('Missing webhook authenticity token')
    }

    const token = this.configService.get<string>('PAGBANK_TOKEN')
    if (!token) {
      throw new UnauthorizedException('Missing PagBank token configuration')
    }

    const isValid = validateWebhookSignature(token, rawBody, authenticityToken)
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature')
    }
  }
}
