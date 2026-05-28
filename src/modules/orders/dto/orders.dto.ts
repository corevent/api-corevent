import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsInt, IsUUID, ValidateNested } from 'class-validator'

class ItemsDto {
  @ApiProperty({ description: 'Ticket type ID', example: '1234567890' })
  @IsUUID()
  ticketTypeId: string

  @ApiProperty({ description: 'Quantity', example: 1 })
  @IsInt()
  quantity: number
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Items', type: [ItemsDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemsDto)
  items: ItemsDto[]
}

export class CheckoutDataDto {
  @ApiProperty({ description: 'Link relation', example: 'self' })
  rel: string

  @ApiProperty({
    description: 'Link href',
    example: 'https://api.pagbank.com/v1/checkouts/123e4567-e89b-12d3-a456-426614174000',
  })
  href: string

  @ApiProperty({ description: 'Link method', example: 'GET' })
  method: string
}

export class OrderDataDto {
  @ApiProperty({ description: 'Order ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  orderId: string

  @ApiProperty({ description: 'Checkout links', type: [CheckoutDataDto] })
  checkoutLinks: CheckoutDataDto[]

  @ApiProperty({ description: 'QR codes', type: [String] })
  qrCodes: string[]

  @ApiProperty({ description: 'Ticket IDs', type: [String] })
  ticketIds: string[]
}

export class OrderResponseDto {
  @ApiProperty({ description: 'Order data', type: OrderDataDto })
  data: OrderDataDto
}
