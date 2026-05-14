import { ApiProperty } from '@nestjs/swagger'

export class MessageDto {
  @ApiProperty({ description: 'Message of the response', example: '[...] successfully' })
  message: string
}
