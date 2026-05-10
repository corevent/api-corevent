import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AuthTokensDto, LoginDto, RefreshTokenDto } from '~/auth/dto/auth.dto'
import { RefreshTokens } from '~/auth/refresh-tokens.entity'
import { UsersService } from '~/modules/users/users.service'
import * as bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

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
}
