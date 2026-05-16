import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuthTokensDto, LoginDto, RefreshTokenDto } from '~/modules/auth/dto/auth.dto'
import { RefreshTokens } from '~/modules/auth/refresh-tokens.entity'
import { UsersService } from '~/modules/users/users.service'
import * as bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { PasswordRecoveryCodesService } from '~/modules/password-recovery-codes/password-recovery-codes.service'
import { MailService } from '~/modules/mail/mail.service'

interface AccessTokenPayload {
  sub: string
  email: string
}

interface RefreshTokenPayload {
  sub: string
  jti: string
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
    @InjectRepository(RefreshTokens)
    private refreshTokensRepository: Repository<RefreshTokens>,
    private passwordRecoveryCodesService: PasswordRecoveryCodesService,
    private mailService: MailService,
  ) {}

  async login(body: LoginDto): Promise<AuthTokensDto> {
    const user = await this.usersService.findByEmail(body.email)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return this.issueTokens(user.id, user.email)
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')
    if (!refreshSecret) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    let payload: RefreshTokenPayload
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: refreshSecret,
      })
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }

    const tokenEntity = await this.refreshTokensRepository.findOne({
      where: {
        jti: payload.jti,
        userId: payload.sub,
      },
      relations: { user: true },
    })

    if (!tokenEntity) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    if (tokenEntity.expiresAt <= new Date()) {
      await this.refreshTokensRepository.delete({ id: tokenEntity.id })
      throw new UnauthorizedException('Refresh token expired')
    }

    await this.refreshTokensRepository.delete({ id: tokenEntity.id })

    return this.issueTokens(tokenEntity.user.id, tokenEntity.user.email)
  }

  async logout(body: RefreshTokenDto): Promise<void> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')
    if (!refreshSecret) {
      throw new UnauthorizedException('Invalid refresh token configuration')
    }

    let payload: RefreshTokenPayload
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(body.refreshToken, {
        secret: refreshSecret,
      })
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }

    try {
      await this.refreshTokensRepository.delete({ userId: payload.sub, jti: payload.jti })
    } catch (error) {
      throw new InternalServerErrorException('Error logging out', { cause: error })
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email)
    if (!user) {
      // don't throw an error if the email doesn't exist
      return { message: 'If the email exists, a code was sent' }
    }

    const { code, codeHash } = await this.generatePasswordResetCode()

    try {
      await this.passwordRecoveryCodesService.createRecoveryAndSendEmail({
        userId: user.id,
        email: user.email,
        code,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        sendEmail: (to, plainCode) => this.mailService.sendRecoveryCode(to, plainCode),
      })
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException('Unable to process password recovery request')
    }

    return { message: 'If the email exists, a code was sent' }
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email)
    if (!user) {
      throw new BadRequestException('User not found')
    }
    await this.passwordRecoveryCodesService.validateCode(user, code)
    await this.usersService.resetPass(user.id, newPassword)
    return { message: 'Password reset successfully' }
  }

  private async issueTokens(userId: string, email: string): Promise<AuthTokensDto> {
    const accessTokenPayload: AccessTokenPayload = {
      sub: userId,
      email,
    }

    const accessToken = await this.jwtService.signAsync(accessTokenPayload)
    const refreshToken = await this.createRefreshToken(userId)

    return {
      accessToken,
      refreshToken,
    }
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')
    if (!refreshSecret) {
      throw new UnauthorizedException('Invalid refresh token configuration')
    }

    const payload: RefreshTokenPayload = { sub: userId, jti: randomUUID() }
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    })

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const tokenEntity = this.refreshTokensRepository.create({
      tokenHash: await bcrypt.hash(refreshToken, 10),
      expiresAt,
      userId,
      jti: payload.jti,
    })

    await this.refreshTokensRepository.save(tokenEntity)

    return refreshToken
  }

  private async generatePasswordResetCode(): Promise<{ code: string; codeHash: string }> {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const codeHash = await bcrypt.hash(code, 10)
    return { code, codeHash }
  }
}
