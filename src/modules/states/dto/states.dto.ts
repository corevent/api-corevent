import { ApiProperty } from '@nestjs/swagger'

export class DataStateDto {
  @ApiProperty({ description: 'The ID of the state based on the IBGE code', example: 35 })
  id: number

  @ApiProperty({ description: 'The name of the state', example: 'São Paulo' })
  name: string

  @ApiProperty({ description: 'The UF of the state', example: 'SP' })
  uf: string
}

export class ResponseStateDto {
  @ApiProperty({ description: 'The list of states', type: [DataStateDto] })
  data: DataStateDto[]
}
