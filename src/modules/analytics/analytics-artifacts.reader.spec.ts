import { Storage } from '@google-cloud/storage'
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { ConfigurableAnalyticsArtifactsReader } from '~/modules/analytics/analytics-artifacts.reader'

describe('ConfigurableAnalyticsArtifactsReader', () => {
  it('reads local JSON artifacts', async () => {
    const directory = join(tmpdir(), `corevent-analytics-${Date.now()}`)
    await mkdir(directory, { recursive: true })
    await writeFile(join(directory, 'eda.json'), JSON.stringify({ source: 'synthetic' }), 'utf8')

    const config = {
      get: (key: string) =>
        ({
          ANALYTICS_ARTIFACTS_BACKEND: 'local',
          ANALYTICS_LOCAL_DIR: directory,
        })[key],
    } as unknown as ConfigService
    const storage = { bucket: jest.fn() } as unknown as Storage
    const reader = new ConfigurableAnalyticsArtifactsReader(config, storage)

    await expect(reader.readJson('eda')).resolves.toEqual({ source: 'synthetic' })
  })

  it('maps missing local files to NotFoundException', async () => {
    const config = {
      get: (key: string) =>
        ({
          ANALYTICS_ARTIFACTS_BACKEND: 'local',
          ANALYTICS_LOCAL_DIR: join(tmpdir(), `missing-${Date.now()}`),
        })[key],
    } as unknown as ConfigService
    const storage = { bucket: jest.fn() } as unknown as Storage
    const reader = new ConfigurableAnalyticsArtifactsReader(config, storage)

    await expect(reader.readJson('eda')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('reads GCS JSON artifacts pinned by generation', async () => {
    const file = {
      getMetadata: jest.fn().mockResolvedValue([{ size: 40, generation: '9' }]),
      download: jest.fn().mockResolvedValue([Buffer.from(JSON.stringify({ source: 'postgres' }))]),
    }
    const bucketFile = jest.fn(() => file)
    const storage = {
      bucket: jest.fn(() => ({ file: bucketFile })),
    } as unknown as Storage
    const config = {
      get: (key: string) =>
        ({
          ANALYTICS_ARTIFACTS_BACKEND: 'gcs',
          GCS_BUCKET: 'corevent',
          ANALYTICS_GCS_PREFIX: 'analytics/',
        })[key],
    } as unknown as ConfigService
    const reader = new ConfigurableAnalyticsArtifactsReader(config, storage)

    await expect(reader.readJson('apriori')).resolves.toEqual({ source: 'postgres' })
    expect(bucketFile).toHaveBeenCalledWith('analytics/apriori.json')
    expect(bucketFile).toHaveBeenCalledWith('analytics/apriori.json', { generation: '9' })
  })

  it('maps invalid JSON to ServiceUnavailableException', async () => {
    const directory = join(tmpdir(), `corevent-analytics-invalid-${Date.now()}`)
    await mkdir(directory, { recursive: true })
    await writeFile(join(directory, 'kmeans.json'), '{bad', 'utf8')

    const config = {
      get: (key: string) =>
        ({
          ANALYTICS_ARTIFACTS_BACKEND: 'local',
          ANALYTICS_LOCAL_DIR: directory,
        })[key],
    } as unknown as ConfigService
    const storage = { bucket: jest.fn() } as unknown as Storage
    const reader = new ConfigurableAnalyticsArtifactsReader(config, storage)

    await expect(reader.readJson('kmeans')).rejects.toBeInstanceOf(ServiceUnavailableException)
  })
})
