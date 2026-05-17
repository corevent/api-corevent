import { NestFactory } from '@nestjs/core'
import { AppModule } from '~/app.module'
import { seedCities } from '~/database/seeds/seed-cities'
import { DataSource } from 'typeorm'
import { ConfigService } from '@nestjs/config'
import { seedUser } from '~/database/seeds/seed-user'

async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  })

  try {
    const dataSource = app.get(DataSource)
    const configService = app.get(ConfigService)

    await seedCities(dataSource)
    if (configService.get<string>('NODE_ENV') === 'development') {
      await seedUser(dataSource)
    }
  } finally {
    await app.close()
  }
}

void run().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
