import { Storage } from '@google-cloud/storage'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { STORAGE_CLIENT } from '~/modules/storage/storage.client'

@Injectable()
export class StorageHealthService {
  private readonly bucketCheckTimeoutMs = 5_000
  private readonly bucketName: string

  constructor(
    configService: ConfigService,
    @Inject(STORAGE_CLIENT) private readonly storage: Storage,
  ) {
    this.bucketName = this.getRequiredConfig(configService, 'GCS_BUCKET')
  }

  async checkBucket(): Promise<'OK' | 'error'> {
    try {
      const [exists] = await this.bucketExists()
      return exists ? 'OK' : 'error'
    } catch {
      return 'error'
    }
  }

  private bucketExists(): Promise<[boolean]> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Bucket health check timed out')), this.bucketCheckTimeoutMs)
      this.storage
        .bucket(this.bucketName)
        .exists()
        .then((result) => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch((error: unknown) => {
          clearTimeout(timer)
          reject(error instanceof Error ? error : new Error('Bucket health check failed'))
        })
    })
  }

  private getRequiredConfig(configService: ConfigService, key: string): string {
    const value = configService.get<string>(key)
    if (!value) {
      throw new Error(`Environment variable ${key} is required`)
    }
    return value
  }
}
