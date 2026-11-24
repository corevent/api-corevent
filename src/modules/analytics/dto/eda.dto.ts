import { ApiProperty } from '@nestjs/swagger'

export class EdaCategoryCountDto {
  @ApiProperty({ example: 'tech' })
  category!: string

  @ApiProperty({ example: 28 })
  count!: number
}

export class EdaOrderStatusCountDto {
  @ApiProperty({ example: 'paid' })
  status!: string

  @ApiProperty({ example: 3960 })
  count!: number
}

export class EdaCategoryUserCountDto {
  @ApiProperty({ example: 'tech' })
  category!: string

  @ApiProperty({ example: 684 })
  users!: number
}

export class EdaTransactionsSummaryDto {
  @ApiProperty({ example: 3000 })
  nTransactions!: number

  @ApiProperty({ example: 2.197 })
  avgCategoriesPerUser!: number

  @ApiProperty({ type: [EdaCategoryUserCountDto] })
  categoryUserCounts!: EdaCategoryUserCountDto[]
}

export class EdaFeatureStatsDto {
  @ApiProperty({ example: 3000 })
  count!: number

  @ApiProperty({ example: 40.92 })
  mean!: number

  @ApiProperty({ example: 14.25 })
  std!: number

  @ApiProperty({ example: 16.86 })
  min!: number

  @ApiProperty({ example: 28.35 })
  p25!: number

  @ApiProperty({ example: 40.9 })
  p50!: number

  @ApiProperty({ example: 52.93 })
  p75!: number

  @ApiProperty({ example: 65.85 })
  max!: number
}

export class EdaDataDto {
  @ApiProperty({ example: 'synthetic' })
  source!: string

  @ApiProperty({ example: '2026-11-24T15:00:00.000Z' })
  generatedAt!: string

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { users: 3000, events: 200 },
  })
  tableCounts!: Record<string, number>

  @ApiProperty({ type: [EdaCategoryCountDto] })
  eventsByCategory!: EdaCategoryCountDto[]

  @ApiProperty({ type: [EdaOrderStatusCountDto] })
  ordersByStatus!: EdaOrderStatusCountDto[]

  @ApiProperty({ type: EdaTransactionsSummaryDto })
  transactionsSummary!: EdaTransactionsSummaryDto

  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/EdaFeatureStatsDto' },
  })
  userFeatureStats!: Record<string, EdaFeatureStatsDto>
}

export class EdaResponseDto {
  @ApiProperty({ type: EdaDataDto })
  data!: EdaDataDto
}
