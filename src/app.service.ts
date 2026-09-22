import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { HealthCheckResponseDto } from '~/dto/app.dto'
import { MailService } from '~/modules/mail/mail.service'
import { StorageHealthService } from '~/modules/storage/storage-health.service'

@Injectable()
export class AppService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    private readonly storageHealthService: StorageHealthService,
  ) {}

  async health(): Promise<HealthCheckResponseDto> {
    const [database, mail, s3] = await Promise.all([
      this.checkDatabase(),
      this.mailService.checkConnection(),
      this.storageHealthService.checkBucket(),
    ])
    const isHealthy = [database, mail, s3].every((dependency) => dependency === 'OK')

    return {
      status: isHealthy ? 'OK' : 'error',
      version: process.env.npm_package_version ?? 'unknown',
      uptime: process.uptime(),
      dependencies: { database, mail, s3 },
    }
  }

  private async checkDatabase(): Promise<string> {
    try {
      const result = await this.dataSource.query<{ ping: number }[]>('SELECT 1 AS ping')
      return result[0]?.ping === 1 ? 'OK' : 'error'
    } catch {
      return 'error'
    }
  }
}
