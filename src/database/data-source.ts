import 'reflect-metadata'
import { join } from 'path'
import { config } from 'dotenv'
import { DataSource } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { entities } from '~/database/entities'

config()

const dbUrl = process.env.DB_URL

const baseConfig = {
  type: 'postgres' as const,
  entities,
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  namingStrategy: new SnakeNamingStrategy(),
}

export default new DataSource(
  dbUrl
    ? {
        ...baseConfig,
        url: dbUrl,
        ssl: { rejectUnauthorized: false },
      }
    : {
        ...baseConfig,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT ?? '5432'),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      },
)
