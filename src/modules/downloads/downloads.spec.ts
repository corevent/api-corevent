import { Storage } from '@google-cloud/storage'
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { Server } from 'node:http'
import { DownloadApp, parseRelease } from '~/modules/downloads/download-release'
import { DownloadsController } from '~/modules/downloads/downloads.controller'
import { DownloadsService } from '~/modules/downloads/downloads.service'
import { ThrottlerModule } from '@nestjs/throttler'

const release = {
  schemaVersion: 1,
  app: 'app',
  environment: 'staging',
  packageName: 'com.corevent.coreventapp.development',
  versionName: '1.0.0',
  versionCode: 42,
  releaseId: '1.0.0-42-123-1',
  commit: 'a'.repeat(40),
  runId: '123',
  runAttempt: 1,
  publishedAt: '2026-11-02T15:00:00Z',
  apkPath: 'downloads/app/releases/1.0.0-42-123-1/app.apk',
  sizeBytes: 1234,
  sha256: 'b'.repeat(64),
}

describe('APK downloads', () => {
  const manifest = {
    name: 'downloads/app/latest.json',
    getMetadata: jest.fn(),
    download: jest.fn(),
  }
  const apk = { getMetadata: jest.fn(), getSignedUrl: jest.fn<Promise<[string]>, [{ expires: number }]>() }
  const file = jest.fn((key: string) => (key.endsWith('.json') ? manifest : apk))
  const storage = { bucket: jest.fn(() => ({ file })) } as unknown as Storage
  const config = {
    get: (key: string) => ({ GCS_BUCKET: 'private-bucket', NODE_ENV: 'staging' })[key],
  } as unknown as ConfigService
  let service: DownloadsService

  beforeEach(() => {
    jest.clearAllMocks()
    manifest.getMetadata.mockResolvedValue([{ size: 800, generation: '17' }])
    manifest.download.mockResolvedValue([Buffer.from(JSON.stringify(release))])
    apk.getMetadata.mockResolvedValue([{ size: 1234, generation: '18', metadata: { sha256: release.sha256 } }])
    apk.getSignedUrl.mockResolvedValue(['https://storage.example/signed-apk'])
    service = new DownloadsService(config, storage)
  })

  it('rejects cross-app, cross-environment and arbitrary object paths', () => {
    for (const changed of [
      { apkPath: 'avatars/private/image.png' },
      { apkPath: '../app.apk' },
      { app: 'work' },
      { environment: 'production' },
      { versionCode: -1 },
      { sha256: 'bad' },
    ]) {
      expect(() => parseRelease({ ...release, ...changed }, DownloadApp.APP, 'staging')).toThrow()
    }
  })

  it('reads the manifest at the checked generation without leaking extra fields', async () => {
    manifest.download.mockResolvedValue([Buffer.from(JSON.stringify({ ...release, privateField: 'secret' }))])
    expect(await service.latest(DownloadApp.APP)).toEqual(release)
    expect(file).toHaveBeenCalledWith('downloads/app/latest.json', { generation: '17' })
  })

  it('pins the signed download to the verified APK generation', async () => {
    expect(await service.download(DownloadApp.APP)).toBe('https://storage.example/signed-apk')
    expect(file).toHaveBeenCalledWith(release.apkPath, { generation: '18' })
    expect(apk.getSignedUrl).toHaveBeenCalledWith(expect.objectContaining({ version: 'v4', action: 'read' }))
    expect(apk.getSignedUrl.mock.calls[0][0].expires - Date.now()).toBeLessThanOrEqual(900000)
  })

  it('returns controlled errors for unpublished or invalid releases', async () => {
    manifest.getMetadata.mockRejectedValueOnce({ code: 404 })
    await expect(service.latest(DownloadApp.APP)).rejects.toBeInstanceOf(NotFoundException)
    manifest.download.mockResolvedValueOnce([Buffer.from('invalid json')])
    await expect(service.latest(DownloadApp.APP)).rejects.toBeInstanceOf(ServiceUnavailableException)
    apk.getMetadata.mockResolvedValueOnce([{ size: 1235 }])
    await expect(service.download(DownloadApp.APP)).rejects.toBeInstanceOf(ServiceUnavailableException)
    expect(apk.getSignedUrl).not.toHaveBeenCalled()
  })

  it('recognizes the existing production NODE_ENV=prod configuration', async () => {
    const productionConfig = {
      get: (key: string) => ({ GCS_BUCKET: 'corevent', NODE_ENV: 'prod' })[key],
    } as unknown as ConfigService
    const productionRelease = { ...release, environment: 'production', packageName: 'com.corevent.coreventapp' }
    manifest.download.mockResolvedValueOnce([Buffer.from(JSON.stringify(productionRelease))])
    const production = new DownloadsService(productionConfig, storage)
    expect(await production.latest(DownloadApp.APP)).toEqual(productionRelease)
  })

  it('serves public metadata and no-cache redirects, while rejecting unknown apps', async () => {
    const module = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }])],
      controllers: [DownloadsController],
      providers: [{ provide: DownloadsService, useValue: service }],
    }).compile()
    const app = module.createNestApplication()
    app.setGlobalPrefix('api')
    await app.listen(0, '127.0.0.1')
    const server = app.getHttpServer() as Server
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Missing server port')
    const baseUrl = `http://127.0.0.1:${address.port}`
    try {
      const latest = await fetch(`${baseUrl}/api/downloads/app/latest`)
      expect(latest.headers.get('cache-control')).toBe('no-store')
      expect(latest.status).toBe(200)
      const body: unknown = await latest.json()
      expect(body).toEqual({ data: release })
      const result = await fetch(`${baseUrl}/api/downloads/app`, { redirect: 'manual' })
      expect(result.headers.get('location')).toBe('https://storage.example/signed-apk')
      expect(result.headers.get('cache-control')).toBe('no-store')
      expect(result.status).toBe(302)
      const unknown = await fetch(`${baseUrl}/api/downloads/other/latest`)
      expect(unknown.status).toBe(400)
    } finally {
      await app.close()
    }
  })
})
