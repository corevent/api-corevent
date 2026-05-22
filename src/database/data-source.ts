import 'reflect-metadata'
import { join } from 'path'
import { config } from 'dotenv'
import { DataSource, DataSourceOptions } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { entities } from '~/database/entities'

config()

const shared = {
  entities,
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  namingStrategy: new SnakeNamingStrategy(),
} satisfies Partial<DataSourceOptions>

const dbUrl = process.env.DB_URL

const options: DataSourceOptions = dbUrl
  ? {
      type: 'postgres',
      url: dbUrl,
      ssl: { rejectUnauthorized: false },
      ...shared,
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      ...shared,
    }

export default new DataSource(options)
