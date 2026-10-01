import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({
    description: 'Email address of the user',
    type: String,
    format: 'email',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email!: string

  @ApiProperty({ description: 'Password of the user', type: String, minLength: 8, example: 'password123' })
  @IsString()
  @MinLength(8)
  password!: string
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token previously issued on login', type: String })
  @IsString()
  refreshToken!: string
}

export class AuthTokensDto {
  @ApiProperty({ description: 'JWT access token', type: String })
  accessToken!: string

  @ApiProperty({ description: 'JWT refresh token', type: String })
  refreshToken!: string
}

export class EmailDto {
  @ApiProperty({
    description: 'Email address of the user',
    type: String,
    format: 'email',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email!: string
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email address of the user',
    type: String,
    format: 'email',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email!: string

  @ApiProperty({ description: 'Code to reset the password', type: String, example: '123456' })
  @IsString()
  code!: string

  @ApiProperty({ description: 'New password of the user', type: String, minLength: 8, example: '@Newpassword123' })
  @IsString()
  @MinLength(8)
  newPassword!: string
}
