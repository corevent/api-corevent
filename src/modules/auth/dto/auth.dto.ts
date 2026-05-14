import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({ description: 'Email address of the user', example: 'john.doe@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ description: 'Password of the user', minLength: 8, example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token previously issued on login' })
  @IsString()
  refreshToken: string
}

export class AuthTokensDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email address of the user', example: 'john.doe@example.com' })
  @IsEmail()
  email: string
}
