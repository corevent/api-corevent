interface Item {
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

export interface CreateCheckout {
  customer: {
    name: string
    email: string
    tax_id: string
  }
  customerModifiable: boolean
  items: [Item]
  redirect_url: string
}

export interface CheckoutResponse extends CreateCheckout {
  id: string
  status: string
  created_at: string
  additional_amount: number
  discount_amount: number
  links: [Link]
  origin: string
}
