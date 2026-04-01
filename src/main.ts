import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { AppModule } from '~/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
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

  const config = new DocumentBuilder()
    .setTitle('API Corevent')
    .setDescription('Event management system')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, document)
  app.use(
    '/docs',
    apiReference({
      content: document,
    }),
  )

  await app.listen(process.env.PORT ?? 3000)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
