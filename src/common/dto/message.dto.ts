import { ApiProperty } from '@nestjs/swagger'

export class MessageDto {
  @ApiProperty({ description: 'Message of the response', type: String, example: '[...] successfully' })
  message!: string
}
