import { ApiProperty } from '@nestjs/swagger'

export class DataCityDto {
  @ApiProperty({ description: 'The ID of the city based on the IBGE code', example: 3525300 })
  id: number

  @ApiProperty({ description: 'The name of the city', example: 'Jaú' })
  name: string

  @ApiProperty({ description: 'The ID of the state', example: 35 })
  stateId: number
}

export class ResponseCityDto {
  @ApiProperty({ description: 'The list of cities', type: [DataCityDto] })
  data: DataCityDto[]
}
