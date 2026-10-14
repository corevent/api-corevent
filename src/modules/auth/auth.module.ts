import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from '~/modules/auth/auth.controller'
import { RefreshTokens } from '~/modules/auth/refresh-tokens.entity'
import { AuthService } from '~/modules/auth/auth.service'
import { JwtStrategy } from '~/modules/auth/strategies/jwt.strategy'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersModule } from '~/modules/users/users.module'
import { PasswordRecoveryCodesModule } from '~/modules/password-recovery-codes/password-recovery-codes.module'
import { MailModule } from '~/modules/mail/mail.module'
import { RegistrationCodesModule } from '~/modules/registration-codes/registration-codes.module'

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([RefreshTokens]),
    UsersModule,
    PasswordRecoveryCodesModule,
    MailModule,
    RegistrationCodesModule,
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
