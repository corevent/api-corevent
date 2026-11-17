import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import { AppModule } from '~/app.module'
import { configureDocumentation } from '~/common/configure-documentation'

function resolveCorsOrigins(configService: ConfigService): string[] | false {
  const corsOrigins = configService.get<string>('CORS_ORIGINS')
  const frontendUrl = configService.get<string>('FRONTEND_URL')?.trim()
  const origins = new Set<string>()

  for (const origin of corsOrigins?.split(',') ?? []) {
    const trimmed = origin.trim()
    if (trimmed) origins.add(trimmed)
  }

  if (frontendUrl) origins.add(new URL(frontendUrl).origin)

  return origins.size > 0 ? [...origins] : false
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true })
  app.setGlobalPrefix('api')
  app.use(helmet())

  const configService = app.get(ConfigService)
  app.enableCors({
    origin: resolveCorsOrigins(configService),
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  configureDocumentation(app, configService.get<string>('NODE_ENV'))

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0')
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
