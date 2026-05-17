import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { MessageDto } from '~/common/dto/message.dto'
import { AuthService } from '~/modules/auth/auth.service'
import { AuthTokensDto, EmailDto, LoginDto, RefreshTokenDto, ResetPasswordDto } from '~/modules/auth/dto/auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, type: AuthTokensDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto): Promise<AuthTokensDto> {
    return this.authService.login(body)
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh auth tokens' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, type: AuthTokensDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() body: RefreshTokenDto): Promise<AuthTokensDto> {
    return this.authService.refresh(body.refreshToken)
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout a user' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
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
  @ApiResponse({ status: 200, type: MessageDto })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async forgotPassword(@Body() body: EmailDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(body.email)
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reset the password of the user' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, type: MessageDto })
  @ApiResponse({ status: 400, description: 'Invalid email or code' })
  async resetPassword(@Body() body: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(body.email, body.code, body.newPassword)
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('verify-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send a verify email code to the user before creating a new user' })
  @ApiBody({ type: EmailDto })
  @ApiResponse({ status: 200, type: MessageDto })
  @ApiResponse({ status: 400, description: 'Invalid email or code' })
  async verifyEmail(@Body() body: EmailDto): Promise<{ message: string }> {
    return this.authService.sendVerifyEmailCode(body.email)
  }
}
