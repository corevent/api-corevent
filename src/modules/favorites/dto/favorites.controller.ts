import { ApiProperty } from '@nestjs/swagger'

export class FavoritesDataDto {
  @ApiProperty({
    description: 'Favorite ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({
    description: 'User ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId!: string

  @ApiProperty({
    description: 'Event ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  eventId!: string
}

export class FavoritesResponseDto {
  @ApiProperty({ description: 'Favorite data', type: FavoritesDataDto })
  data!: FavoritesDataDto
}
