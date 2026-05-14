import { ApiProperty } from '@nestjs/swagger'

export class MessageDto {
  @ApiProperty({ description: 'Message', example: '[...] successfully' })
  message: string
}
