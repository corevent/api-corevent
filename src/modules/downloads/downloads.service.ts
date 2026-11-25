import { Storage } from '@google-cloud/storage'
import { Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DownloadApp, DownloadEnvironment, DownloadRelease, parseRelease } from '~/modules/downloads/download-release'
import { STORAGE_CLIENT } from '~/modules/storage/storage.client'

@Injectable()
export class DownloadsService {
  constructor(
    private readonly config: ConfigService,
    @Inject(STORAGE_CLIENT) private readonly storage: Storage,
  ) {}

  async latest(app: DownloadApp): Promise<DownloadRelease> {
    try {
      const manifest = this.bucket().file(`downloads/${app}/latest.json`)
      const [metadata] = await manifest.getMetadata()
      if (Number(metadata.size) > 65536) throw new Error('Manifest too large')
      // Pin the content to the generation whose size was checked.
      const [content] = await this.bucket().file(manifest.name, { generation: metadata.generation }).download()
      return parseRelease(JSON.parse(content.toString('utf8')), app, this.environment())
    } catch (error) {
      if (this.isMissing(error)) throw new NotFoundException('No APK published for this application')
      throw new ServiceUnavailableException('APK information is temporarily unavailable')
    }
  }

  async download(app: DownloadApp): Promise<string> {
    const release = await this.latest(app)
    try {
      const file = this.bucket().file(release.apkPath)
      const [metadata] = await file.getMetadata()
      if (Number(metadata.size) !== release.sizeBytes || metadata.metadata?.sha256 !== release.sha256) {
        throw new Error('Artifact does not match manifest')
      }
      const filename = `corevent-${app}-${release.environment}-${release.versionCode}.apk`
      const [url] = await this.bucket()
        .file(release.apkPath, { generation: metadata.generation })
        .getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 15 * 60 * 1000,
          responseType: 'application/vnd.android.package-archive',
          responseDisposition: `attachment; filename="${filename}"`,
        })
      return url
    } catch (error) {
      if (this.isMissing(error)) throw new NotFoundException('APK file is not available')
      throw new ServiceUnavailableException('APK download is temporarily unavailable')
    }
  }

  private bucket() {
    const bucket = this.config.get<string>('GCS_BUCKET')
    if (!bucket) throw new Error('GCS_BUCKET is required')
    return this.storage.bucket(bucket)
  }

  private environment(): DownloadEnvironment {
    const configured = this.config.get<string>('APK_DOWNLOADS_ENVIRONMENT')
    const nodeEnvironment = this.config.get<string>('NODE_ENV')
    const value =
      configured ?? (nodeEnvironment === 'production' || nodeEnvironment === 'prod' ? 'production' : 'staging')
    if (value !== 'staging' && value !== 'production') throw new Error('Invalid APK download environment')
    return value
  }

  private isMissing(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && Number(error.code) === 404
  }
}
