import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'
import { DataSource } from 'typeorm'
import { AppModule } from '~/app.module'
import { Cities } from '~/modules/cities/cities.entity'
import { seedCities } from '~/database/seeds/seed-cities'

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

  // Run seed if no cities are found
  const dataSource = app.get(DataSource)
  const cityRepo = dataSource.getRepository(Cities)

  const count = await cityRepo.count()

  if (count === 0) {
    console.log('Running seed...')
    await seedCities(dataSource)
  }

  await app.listen(process.env.PORT ?? 3000)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
