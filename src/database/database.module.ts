import { join } from 'path'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { resolvePostgresSsl } from '~/common/utils/postgres-ssl.util'
import { entities } from '~/database/entities'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DB_URL')
        const ssl = resolvePostgresSsl({
          isSslEnabled: Boolean(dbUrl) || configService.get<string>('DB_SSL') === 'true',
          rejectUnauthorizedEnv: configService.get<string>('DB_SSL_REJECT_UNAUTHORIZED'),
          ca: configService.get<string>('DB_SSL_CA'),
        })

        if (dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            ssl,
            entities,
            migrations: [join(__dirname, 'migrations', '*.{js,ts}')],
            migrationsRun: false,
            synchronize: false,
            namingStrategy: new SnakeNamingStrategy(),
          }
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: Number(configService.get<string>('DB_PORT') ?? '5432'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities,
          migrations: [join(__dirname, 'migrations', '*.{js,ts}')],
          migrationsRun: false,
          synchronize: false,
          namingStrategy: new SnakeNamingStrategy(),
          ssl,
        }
      },
    }),
  ],
})
export class DatabaseModule {}
