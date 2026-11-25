import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class KmeansMetricsDto {
  @ApiProperty({ example: 2 })
  nClusters!: number

  @ApiPropertyOptional({ example: 56195.6, nullable: true })
  inertia?: number | null

  @ApiPropertyOptional({ example: 0.1577, nullable: true })
  silhouette?: number | null
}

export class KmeansCandidateDto {
  @ApiProperty({ example: 2 })
  k!: number

  @ApiPropertyOptional({ example: 56195.6, nullable: true })
  inertia?: number | null

  @ApiPropertyOptional({ example: 0.1577, nullable: true })
  silhouette?: number | null
}

export class KmeansSelectionDto {
  @ApiPropertyOptional({ example: 2, nullable: true })
  bestK?: number | null

  @ApiProperty({ type: [KmeansCandidateDto] })
  candidates!: KmeansCandidateDto[]
}

export class KmeansCentroidDto {
  @ApiPropertyOptional({ example: 40.58 })
  age?: number

  @ApiPropertyOptional({ example: 773.27 })
  account_age_days?: number

  @ApiPropertyOptional({ example: 0.2 })
  n_orders?: number

  @ApiPropertyOptional({ example: 22.84 })
  total_spent?: number

  @ApiPropertyOptional({ example: 19.67 })
  avg_ticket?: number

  @ApiPropertyOptional({ example: 2.28 })
  n_favorites?: number

  @ApiPropertyOptional({ example: 0.32 })
  n_tickets?: number

  @ApiPropertyOptional({ example: 0.1 })
  checkin_rate?: number

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { music: 0.1994, tech: 0.221 },
  })
  categories!: Record<string, number>
}

export class KmeansClusterDto {
  @ApiProperty({ example: 0 })
  clusterId!: number

  @ApiProperty({ example: 1705 })
  size!: number

  @ApiProperty({ example: 0.5683 })
  share!: number

  @ApiProperty({ type: KmeansCentroidDto })
  centroid!: KmeansCentroidDto
}

export class KmeansPcaPointDto {
  @ApiProperty({ example: -1.23 })
  x!: number

  @ApiProperty({ example: 0.45 })
  y!: number

  @ApiProperty({ example: 0 })
  clusterId!: number
}

export class KmeansPcaSampleDto {
  @ApiProperty({ type: [Number], example: [0.18, 0.09] })
  explainedVarianceRatio!: number[]

  @ApiProperty({ type: [KmeansPcaPointDto] })
  points!: KmeansPcaPointDto[]
}

export class KmeansDataDto {
  @ApiProperty({ example: 'synthetic' })
  source!: string

  @ApiProperty({ example: '2026-11-24T15:00:00.000Z' })
  generatedAt!: string

  @ApiProperty({ type: KmeansMetricsDto })
  metrics!: KmeansMetricsDto

  @ApiProperty({ type: KmeansSelectionDto })
  kSelection!: KmeansSelectionDto

  @ApiProperty({ type: [KmeansClusterDto] })
  clusters!: KmeansClusterDto[]

  @ApiProperty({ type: KmeansPcaSampleDto })
  pcaSample!: KmeansPcaSampleDto
}

export class KmeansResponseDto {
  @ApiProperty({ type: KmeansDataDto })
  data!: KmeansDataDto
}
