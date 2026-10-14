import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { CheckoutResponse, CreateCheckout } from '~/modules/pagbank/interface/pagbank.interface'

@Injectable()
export class PagBankService {
  constructor(private readonly http: HttpService) {}

  async createCheckout(body: CreateCheckout): Promise<CheckoutResponse> {
    const response = await this.http.axiosRef.post<CheckoutResponse>('/checkouts', body)
    return response.data
  }

  async getCheckoutById(checkoutId: string): Promise<CheckoutResponse> {
    const response = await this.http.axiosRef.get<CheckoutResponse>(`/checkouts/${checkoutId}`)
    return response.data
  }
}
