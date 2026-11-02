export enum DownloadApp {
  APP = 'app',
  WORK = 'work',
}

export type DownloadEnvironment = 'staging' | 'production'

export interface DownloadRelease {
  schemaVersion: 1
  app: DownloadApp
  environment: DownloadEnvironment
  packageName: string
  versionName: string
  versionCode: number
  releaseId: string
  commit: string
  runId: string
  runAttempt: number
  publishedAt: string
  apkPath: string
  sizeBytes: number
  sha256: string
}

export function packageName(app: DownloadApp, environment: DownloadEnvironment): string {
  const base = app === DownloadApp.APP ? 'com.corevent.coreventapp' : 'com.corevent.corevent_work_app'
  return environment === 'staging' ? `${base}.development` : base
}

export function parseRelease(raw: unknown, app: DownloadApp, environment: DownloadEnvironment): DownloadRelease {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid release')
  const r = raw as Record<string, unknown>
  const positive = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) > 0
  const matches = (value: unknown, pattern: RegExp): value is string => typeof value === 'string' && pattern.test(value)
  if (
    r.schemaVersion !== 1 ||
    r.app !== app ||
    r.environment !== environment ||
    r.packageName !== packageName(app, environment) ||
    !matches(r.versionName, /^\d+\.\d+\.\d+(?:[.-][a-zA-Z0-9]+)*$/) ||
    !positive(r.versionCode) ||
    r.versionCode > 2100000000 ||
    !matches(r.commit, /^[a-f0-9]{40}$/) ||
    !matches(r.runId, /^\d+$/) ||
    !positive(r.runAttempt) ||
    !positive(r.sizeBytes) ||
    !matches(r.sha256, /^[a-f0-9]{64}$/) ||
    !matches(r.publishedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/) ||
    !Number.isFinite(Date.parse(r.publishedAt))
  )
    throw new Error('Invalid release')
  const releaseId = `${r.versionName}-${r.versionCode}-${r.runId}-${r.runAttempt}`
  if (r.releaseId !== releaseId || r.apkPath !== `downloads/${app}/releases/${releaseId}/app.apk`) {
    throw new Error('Invalid release path')
  }
  return {
    schemaVersion: 1,
    app,
    environment,
    packageName: r.packageName,
    versionName: r.versionName,
    versionCode: r.versionCode,
    releaseId,
    commit: r.commit,
    runId: r.runId,
    runAttempt: r.runAttempt,
    publishedAt: r.publishedAt,
    apkPath: r.apkPath,
    sizeBytes: r.sizeBytes,
    sha256: r.sha256,
  }
}
