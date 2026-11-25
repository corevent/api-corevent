import { Storage } from '@google-cloud/storage'
import { Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  ANALYTICS_ARTIFACT_FILES,
  AnalyticsAnalysis,
} from '~/modules/analytics/analytics-analysis'
import { STORAGE_CLIENT } from '~/modules/storage/storage.client'

export const ANALYTICS_ARTIFACTS_READER = 'ANALYTICS_ARTIFACTS_READER'

export type AnalyticsArtifactsBackend = 'local' | 'gcs'

export abstract class AnalyticsArtifactsReader {
  abstract readJson(analysis: AnalyticsAnalysis): Promise<unknown>
}

@Injectable()
export class ConfigurableAnalyticsArtifactsReader extends AnalyticsArtifactsReader {
  constructor(
    private readonly config: ConfigService,
    @Inject(STORAGE_CLIENT) private readonly storage: Storage,
  ) {
    super()
  }

  async readJson(analysis: AnalyticsAnalysis): Promise<unknown> {
    const fileName = ANALYTICS_ARTIFACT_FILES[analysis]
    try {
      const raw = await this.readRaw(fileName)
      return JSON.parse(raw) as unknown
    } catch (error) {
      if (error instanceof NotFoundException) throw error
      if (this.isMissing(error)) throw new NotFoundException(`Analytics artifact not found: ${fileName}`)
      throw new ServiceUnavailableException('Analytics artifacts are temporarily unavailable')
    }
  }

  private async readRaw(fileName: string): Promise<string> {
    if (this.backend() === 'gcs') {
      return this.readFromGcs(fileName)
    }
    return this.readFromLocal(fileName)
  }

  private async readFromLocal(fileName: string): Promise<string> {
    const directory = this.config.get<string>('ANALYTICS_LOCAL_DIR')
    if (!directory) throw new Error('ANALYTICS_LOCAL_DIR is required when ANALYTICS_ARTIFACTS_BACKEND=local')
    try {
      return await readFile(join(directory, fileName), 'utf8')
    } catch (error) {
      if (this.isLocalMissing(error)) {
        throw new NotFoundException(`Analytics artifact not found: ${fileName}`)
      }
      throw error
    }
  }

  private async readFromGcs(fileName: string): Promise<string> {
    const objectPath = `${this.gcsPrefix()}${fileName}`
    const file = this.bucket().file(objectPath)
    const [metadata] = await file.getMetadata()
    if (Number(metadata.size) > 8_000_000) throw new Error('Analytics artifact too large')
    const [content] = await this.bucket().file(objectPath, { generation: metadata.generation }).download()
    return content.toString('utf8')
  }

  private backend(): AnalyticsArtifactsBackend {
    const configured = this.config.get<string>('ANALYTICS_ARTIFACTS_BACKEND') ?? 'local'
    if (configured !== 'local' && configured !== 'gcs') {
      throw new Error('ANALYTICS_ARTIFACTS_BACKEND must be local or gcs')
    }
    return configured
  }

  private gcsPrefix(): string {
    const configured = this.config.get<string>('ANALYTICS_GCS_PREFIX') ?? 'analytics/'
    return configured.endsWith('/') ? configured : `${configured}/`
  }

  private bucket() {
    const bucket = this.config.get<string>('GCS_BUCKET')
    if (!bucket) throw new Error('GCS_BUCKET is required when ANALYTICS_ARTIFACTS_BACKEND=gcs')
    return this.storage.bucket(bucket)
  }

  private isMissing(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && Number(error.code) === 404
  }

  private isLocalMissing(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT'
  }
}
