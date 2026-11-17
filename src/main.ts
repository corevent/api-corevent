import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import helmet from 'helmet'
import { AppModule } from '~/app.module'

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

  if (configService.get<string>('NODE_ENV') === 'development') {
    const config = new DocumentBuilder()
      .setTitle('API Corevent')
      .setDescription('Event management system')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('swagger', app, document)
    app.use(
      '/docs',
      apiReference({
        content: document,
      }),
    )
  }

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0')
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
