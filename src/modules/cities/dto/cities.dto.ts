import { ApiProperty } from '@nestjs/swagger'

export class CityDataDto {
  @ApiProperty({ description: 'The ID of the city based on the IBGE code', type: Number, example: 3525300 })
  id!: number

  @ApiProperty({ description: 'The name of the city', type: String, example: 'Jaú' })
  name!: string

  @ApiProperty({ description: 'The ID of the state', type: Number, example: 35 })
  stateId!: number
}

export class CityResponseDto {
  @ApiProperty({ description: 'The list of cities', type: [CityDataDto] })
  data!: CityDataDto[]
}
