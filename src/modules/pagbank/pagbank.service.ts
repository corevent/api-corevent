import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { CheckoutResponse, CreateCheckout } from '~/modules/pagbank/interface/pagbank.interface'

@Injectable()
export class PagBankService {
  constructor(private readonly http: HttpService) {}

  async createCheckout(body: CreateCheckout): Promise<CheckoutResponse> {
    const response = await this.http.axiosRef.post('/checkouts', body, {
      headers: {
        Authorization: `Bearer ${process.env.PAGBANK_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })

    return response.data as CheckoutResponse
  }
}
