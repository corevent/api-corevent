import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ClassificationFeatureImportanceDto {
  @ApiProperty({ example: 'account_age_days' })
  feature!: string

  @ApiProperty({ example: 0.24 })
  importance!: number
}

export class ClassificationModelMetricsDto {
  @ApiPropertyOptional({ example: 0.5333, nullable: true })
  accuracy?: number | null

  @ApiPropertyOptional({ example: 0.5632, nullable: true })
  precision?: number | null

  @ApiPropertyOptional({ example: 0.5177, nullable: true })
  recall?: number | null

  @ApiPropertyOptional({ example: 0.5395, nullable: true })
  f1?: number | null

  @ApiProperty({ type: 'array', items: { type: 'array', items: { type: 'number' } }, example: [[195, 159], [191, 205]] })
  confusionMatrix!: number[][]

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { '0': { precision: 0.505, recall: 0.551, 'f1-score': 0.527, support: 354 } },
  })
  classificationReport!: Record<string, unknown>

  @ApiPropertyOptional({ type: [ClassificationFeatureImportanceDto] })
  featureImportances?: ClassificationFeatureImportanceDto[]
}

export class ClassificationModelsDto {
  @ApiProperty({ type: ClassificationModelMetricsDto })
  randomForest!: ClassificationModelMetricsDto

  @ApiProperty({ type: ClassificationModelMetricsDto })
  mlp!: ClassificationModelMetricsDto
}

export class ClassificationDataDto {
  @ApiProperty({ example: 'synthetic' })
  source!: string

  @ApiProperty({ example: '2026-11-24T15:00:00.000Z' })
  generatedAt!: string

  @ApiProperty({ example: 3000 })
  nSamples!: number

  @ApiProperty({ example: 2250 })
  nTrain!: number

  @ApiProperty({ example: 750 })
  nTest!: number

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { '0': 0.4723, '1': 0.5277 },
  })
  classBalance!: Record<string, number>

  @ApiProperty({ type: [String], example: ['age', 'account_age_days', 'n_favorites'] })
  featureColumns!: string[]

  @ApiProperty({ type: ClassificationModelsDto })
  models!: ClassificationModelsDto
}

export class ClassificationResponseDto {
  @ApiProperty({ type: ClassificationDataDto })
  data!: ClassificationDataDto
}
