import { Controller } from '@nestjs/common'
import { PagBankService } from '~/modules/pagbank/pagbank.service'

@Controller('pagbank')
export class PagBankController {
  constructor(private readonly pagBankService: PagBankService) {}

  /*@Post('create-checkout')
  async createCheckout(@Body() body: CreateCheckout): Promise<CheckoutResponse> {
    return this.pagBankService.createCheckout(body)
  }*/
}
