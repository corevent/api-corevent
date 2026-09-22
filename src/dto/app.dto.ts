import { ApiProperty } from '@nestjs/swagger'

export class HealthDependenciesDto {
  @ApiProperty({
    description: 'The status of the database health check',
    example: 'OK',
    type: String,
  })
  database: string

  @ApiProperty({
    description: 'The status of the Resend SMTP connection',
    example: 'OK',
    type: String,
  })
  mail: string

  @ApiProperty({
    description: 'The status of the S3 bucket health check',
    example: 'OK',
    type: String,
  })
  s3: string
}

export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'The status of the application general health check',
    example: 'OK',
    type: String,
  })
  status: string

  @ApiProperty({
    description: 'The version of the application',
    example: '1.0.0',
    type: String,
  })
  version: string

  @ApiProperty({
    description: 'The uptime of the application',
    example: 1000,
    type: Number,
  })
  uptime: number

  @ApiProperty({
    description: 'The status of each external dependency',
    type: HealthDependenciesDto,
  })
  dependencies: HealthDependenciesDto
}
