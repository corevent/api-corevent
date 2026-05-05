import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from '~/auth/auth.controller'
import { RefreshTokens } from '~/auth/refresh-tokens.entity'
import { AuthService } from '~/auth/auth.service'
import { JwtStrategy } from '~/auth/strategies/jwt.strategy'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from '~/modules/users/users.module'

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([RefreshTokens]),
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' }, // 1 hour just for testing
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService],
  exports: [PassportModule, JwtModule, AuthService],
})
export class AuthModule {}
