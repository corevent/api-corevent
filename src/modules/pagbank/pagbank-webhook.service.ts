import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { OrdersService } from '~/modules/orders/orders.service'
import { PagBankWebhookPayload } from '~/modules/pagbank/interface/pagbank.interface'
// import { ConfigService } from '@nestjs/config'
// import { validateWebhookSignature } from '~/modules/pagbank/utils/validate-webhook-signature.util'

@Injectable()
export class PagBankWebhookService {
  private readonly logger = new Logger(PagBankWebhookService.name)

  constructor(
    // private readonly configService: ConfigService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  async handleWebhook(rawBody: string): Promise<void> {
    // this.validateAuthenticity(rawBody, authenticityToken)

    const payload = JSON.parse(rawBody) as PagBankWebhookPayload
    const chargeStatuses = payload.charges?.map((charge) => charge.status) ?? []
    const isPaid = payload.charges?.some((charge) => charge.status === 'PAID') ?? false

    this.logger.log(
      [
        'Webhook payload',
        `id=${payload.id}`,
        `referenceId=${payload.reference_id ?? 'none'}`,
        `chargeStatuses=[${chargeStatuses.join(', ')}]`,
        `isPaid=${isPaid}`,
      ].join(' '),
    )

    if (!isPaid) {
      this.logger.log('Webhook ignored: no charge with PAID status')
      return
    }

    const checkoutId = payload.id.startsWith('CHEC_') ? payload.id : null
    const referenceId = payload.reference_id ?? null

    this.logger.log(`Marking order as paid checkoutId=${checkoutId ?? 'none'} referenceId=${referenceId ?? 'none'}`)
    await this.ordersService.markAsPaidFromWebhook(checkoutId, referenceId)
  }

  // private validateAuthenticity(rawBody: string, authenticityToken: string | undefined): void {
  //   if (!authenticityToken) {
  //     this.logger.warn('Webhook rejected: missing x-authenticity-token header')
  //     throw new UnauthorizedException('Missing webhook authenticity token')
  //   }
  //
  //   const token = this.configService.get<string>('PAGBANK_TOKEN')
  //   if (!token) {
  //     this.logger.warn('Webhook rejected: PAGBANK_TOKEN is not configured')
  //     throw new UnauthorizedException('Missing PagBank token configuration')
  //   }
  //
  //   const isValid = validateWebhookSignature(token, rawBody, authenticityToken)
  //   if (!isValid) {
  //     this.logger.warn(
  //       [
  //         'Webhook rejected: invalid signature',
  //         `rawBodyLength=${rawBody.length}`,
  //         'tokenConfigured=true',
  //         `authenticityTokenLength=${authenticityToken.length}`,
  //       ].join(' '),
  //     )
  //     throw new UnauthorizedException('Invalid webhook signature')
  //   }
  // }
}
