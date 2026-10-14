export interface Item {
  reference_id: string
  name: string
  quantity: number
  unit_amount: number
}

interface Link {
  rel: string
  href: string
  method: string
}

export interface PagBankCheckoutOrder {
  id: string
  links?: Link[]
}

export interface CreateCheckout {
  reference_id: string
  customer: {
    name: string
    email: string
    tax_id: string
  }
  customerModifiable: boolean
  items: Item[]
  redirect_url: string
  notification_urls?: string[]
}

export interface CheckoutResponse extends CreateCheckout {
  id: string
  status: string
  created_at: string
  additional_amount: number
  discount_amount: number
  links: Link[]
  origin: string
  orders?: PagBankCheckoutOrder[]
}

export type PagBankChargeStatus = 'PAID' | 'IN_ANALYSIS' | 'DECLINED' | 'CANCELED' | 'WAITING'

export interface PagBankWebhookCharge {
  id: string
  status: PagBankChargeStatus
}

export interface PagBankWebhookPayload {
  id: string
  reference_id?: string
  status?: string
  charges?: PagBankWebhookCharge[]
}
