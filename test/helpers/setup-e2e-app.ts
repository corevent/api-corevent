import { NestExpressApplication } from '@nestjs/platform-express'
import { createTestApp, type CreateTestAppOptions } from './create-test-app'

export function setupE2EApp(options: CreateTestAppOptions = {}): { app: NestExpressApplication } {
  const ctx: { app: NestExpressApplication } = {
    app: undefined as unknown as NestExpressApplication,
  }

  beforeAll(async () => {
    const testApp = await createTestApp(options)
    ctx.app = testApp.app
  })

  afterAll(async () => {
    await ctx.app?.close()
  })

  return ctx
}
