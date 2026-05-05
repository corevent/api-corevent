import { NestFactory } from '@nestjs/core'
import { AppModule } from '~/app.module'
import { seedCities } from '~/database/seeds/seed-cities'
import { DataSource } from 'typeorm'

async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  })

  try {
    const dataSource = app.get(DataSource)
    await seedCities(dataSource)
  } finally {
    await app.close()
  }
}

void run().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
