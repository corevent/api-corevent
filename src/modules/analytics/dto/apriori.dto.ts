import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class AprioriMetaDto {
  @ApiProperty({ example: 3000 })
  nTransactions!: number

  @ApiProperty({ example: 0.05 })
  minSupport!: number

  @ApiProperty({ example: 0.3 })
  minConfidence!: number

  @ApiProperty({ example: 35 })
  nItemsets!: number

  @ApiProperty({ example: 42 })
  nRules!: number
}

export class AprioriItemsetDto {
  @ApiProperty({ type: [String], example: ['music', 'gastronomy'] })
  items!: string[]

  @ApiProperty({ example: 0.102667 })
  support!: number
}

export class AprioriRuleDto {
  @ApiProperty({ type: [String], example: ['sports'] })
  antecedents!: string[]

  @ApiProperty({ type: [String], example: ['family_kids'] })
  consequents!: string[]

  @ApiProperty({ example: 0.118333 })
  antecedentSupport!: number

  @ApiProperty({ example: 0.121 })
  consequentSupport!: number

  @ApiProperty({ example: 0.058 })
  support!: number

  @ApiProperty({ example: 0.490141 })
  confidence!: number

  @ApiProperty({ example: 4.050751 })
  lift!: number

  @ApiPropertyOptional({ example: 0.043682, nullable: true })
  leverage?: number | null

  @ApiPropertyOptional({ example: 1.724005, nullable: true })
  conviction?: number | null

  @ApiPropertyOptional({ example: 0.8542, nullable: true })
  zhangsMetric?: number | null

  @ApiPropertyOptional({ example: 0.3198, nullable: true })
  jaccard?: number | null

  @ApiPropertyOptional({ example: 0.42, nullable: true })
  certainty?: number | null

  @ApiPropertyOptional({ example: 0.4847, nullable: true })
  kulczynski?: number | null
}

export class AprioriDataDto {
  @ApiProperty({ example: 'synthetic' })
  source!: string

  @ApiProperty({ example: '2026-11-24T15:00:00.000Z' })
  generatedAt!: string

  @ApiProperty({ type: AprioriMetaDto })
  meta!: AprioriMetaDto

  @ApiProperty({ type: [AprioriItemsetDto] })
  frequentItemsets!: AprioriItemsetDto[]

  @ApiProperty({ type: [AprioriRuleDto] })
  rules!: AprioriRuleDto[]
}

export class AprioriResponseDto {
  @ApiProperty({ type: AprioriDataDto })
  data!: AprioriDataDto
}
