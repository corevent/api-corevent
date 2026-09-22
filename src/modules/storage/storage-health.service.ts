import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class StorageHealthService {
  private readonly bucketCheckTimeoutMs = 5_000
  private readonly s3: S3Client
  private readonly bucket: string

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.getRequiredConfig('AWS_S3_BUCKET')
    this.s3 = new S3Client({
      region: this.getRequiredConfig('AWS_REGION'),
      credentials: {
        accessKeyId: this.getRequiredConfig('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.getRequiredConfig('AWS_SECRET_ACCESS_KEY'),
      },
    })
  }

  async checkBucket(): Promise<'OK' | 'error'> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }), {
        abortSignal: AbortSignal.timeout(this.bucketCheckTimeoutMs),
      })
      return 'OK'
    } catch {
      return 'error'
    }
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key)
    if (!value) {
      throw new Error(`Environment variable ${key} is required`)
    }
    return value
  }
}
