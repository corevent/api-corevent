import { join } from 'path'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { entities } from '~/database/entities'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT') ?? '5432'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities,
        migrations: [join(__dirname, 'migrations', '*.{js,ts}')],
        migrationsRun: false,
        synchronize: false, // configService.get<string>('NODE_ENV') === 'development',
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
  ],
})
export class DatabaseModule {}
