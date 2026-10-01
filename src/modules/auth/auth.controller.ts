import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'
import { MessageDto } from '~/common/dto/message.dto'
import { AuthService } from '~/modules/auth/auth.service'
import { AuthTokensDto, EmailDto, LoginDto, RefreshTokenDto, ResetPasswordDto } from '~/modules/auth/dto/auth.dto'
import { CreateUserDto, UserResponseDto } from '~/modules/users/dto/users.dto'
import { UsersService } from '~/modules/users/users.service'

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthTokensDto, description: 'The access and refresh tokens.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() body: LoginDto): Promise<AuthTokensDto> {
    return this.authService.login(body)
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh auth tokens' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ type: AuthTokensDto, description: 'The new access and refresh tokens.' })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token. Refresh token expired' })
  async refresh(@Body() body: RefreshTokenDto): Promise<AuthTokensDto> {
    return this.authService.refresh(body.refreshToken)
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout a user' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: 'The refresh token has been revoked.' })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  async logout(@Body() body: RefreshTokenDto): Promise<void> {
    return this.authService.logout(body)
  }

  // prevent brute force attacks or spamming
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Send a recovery code to the user',
    description: "Note: It will not throw an error if the email doesn't exist",
  })
  @ApiBody({ type: EmailDto })
  @ApiOkResponse({ type: MessageDto, description: 'The recovery code email has been requested.' })
  @ApiBadRequestResponse({ description: 'Invalid email' })
  async forgotPassword(@Body() body: EmailDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(body.email)
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset the password of the user' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ type: MessageDto, description: 'The password has been reset.' })
  @ApiBadRequestResponse({
    description: [
      'User not found.',
      'Invalid code.',
      'Code expired.',
      'Code expired due to maximum attempts reached.',
      'Password must be at least 8 characters long.',
    ].join(' '),
  })
  async resetPassword(@Body() body: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(body.email, body.code, body.newPassword)
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('verify-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send a verify email code to the user before creating a new user' })
  @ApiBody({ type: EmailDto })
  @ApiOkResponse({ type: MessageDto, description: 'The verification code email has been requested.' })
  @ApiBadRequestResponse({ description: 'Email already used by another user. Invalid email' })
  async verifyEmail(@Body() body: EmailDto): Promise<{ message: string }> {
    return this.authService.sendVerifyEmailCode(body.email)
  }

  @Post('register')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ type: UserResponseDto, description: 'The user has been created.' })
  @ApiBadRequestResponse({
    description: [
      'Invalid code.',
      'Code expired.',
      'Invalid CPF.',
      'Invalid CNPJ.',
      'Document already used by another user.',
      'Email already used by another user.',
      'Password must be at least 8 characters long.',
      'Password must contain at least one lowercase letter.',
      'Password must contain at least one uppercase letter.',
      'Password must contain at least one number.',
      'Password must contain at least one special character.',
    ].join(' '),
  })
  async create(@Body() body: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(body)
  }
}
