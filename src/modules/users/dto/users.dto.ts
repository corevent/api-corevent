import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'

// Base dto to set common fields for user creation and update
export class BaseUserDto {
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'User CPF', example: '12345678900' })
  @IsString()
  @Length(11, 11)
  cpf: string

  @ApiProperty({ description: 'User avatar URL', example: 'https://example.com/avatar.png' })
  @IsString()
  @IsOptional()
  avatarUrl?: string
}

export class CreateUserDto extends BaseUserDto {
  @ApiProperty({ description: 'User email', example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({ description: 'User password', example: 'password' })
  @IsString()
  @IsNotEmpty()
  password: string

  @ApiProperty({ description: 'User birth date', example: '1990-01-01' })
  @IsDateString()
  @IsNotEmpty()
  birthDate: string
}

export class UpdateUserDto extends PartialType(BaseUserDto) {}

export class UserDataDto {
  @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string

  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @Expose()
  name: string

  @ApiProperty({ description: 'User email', example: 'john.doe@example.com' })
  @Expose()
  email: string

  @ApiProperty({ description: 'User CPF', example: '12345678900' })
  @Expose()
  cpf: string

  @ApiProperty({ description: 'User birth date', example: '1990-01-01' })
  @Expose()
  birthDate: string

  @ApiProperty({ description: 'User avatar URL', example: 'https://example.com/avatar.png' })
  @Expose()
  avatarUrl?: string

  @ApiProperty({ description: 'User created at', example: '2021-01-01T00:00:00.000Z' })
  @Expose()
  createdAt: Date
}

export class UserResponseDto {
  @ApiProperty({ description: 'User data', type: UserDataDto })
  data: UserDataDto
}
