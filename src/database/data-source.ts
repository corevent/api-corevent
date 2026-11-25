import 'reflect-metadata'
import { join } from 'path'
import { config } from 'dotenv'
import { DataSource } from 'typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { resolvePostgresSsl } from '~/common/utils/postgres-ssl.util'
import { entities } from '~/database/entities'

config()

const dbUrl = process.env.DB_URL
const ssl = resolvePostgresSsl({
  isSslEnabled: Boolean(dbUrl) || process.env.DB_SSL === 'true',
  rejectUnauthorizedEnv: process.env.DB_SSL_REJECT_UNAUTHORIZED,
  ca: process.env.DB_SSL_CA,
})

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
        ssl,
      }
    : {
        ...baseConfig,
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT ?? '5432'),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl,
      },
)
