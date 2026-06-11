import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator'
import { DocumentType } from '~/modules/users/enums/document-type.enum'

// Base dto to set common fields for user creation and update
export class BaseUserDto {
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'User phone number', example: '12345678900' })
  @IsPhoneNumber('BR')
  @IsOptional()
  phoneNumber?: string

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

  @ApiProperty({ description: 'User document type', example: DocumentType.CPF, enum: DocumentType })
  @IsEnum(DocumentType)
  documentType: DocumentType

  @ApiProperty({ description: 'User document number (CPF or CNPJ)', example: '12345678900' })
  @IsString()
  @IsNotEmpty()
  @Length(11, 14)
  document: string

  @ApiProperty({ description: 'User verify email code', example: '123456' })
  @IsString()
  @IsNotEmpty()
  verifyEmailCode: string
}

export class UpdateUserDto extends PartialType(OmitType(BaseUserDto, ['avatarUrl'])) {}

export class UpdatePassDto {
  @ApiProperty({ description: 'User current password', example: '@Password123' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string

  @ApiProperty({ description: 'User new password', example: '@Newpassword123' })
  @IsString()
  @IsNotEmpty()
  newPassword: string
}

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

  @ApiProperty({ description: 'User document type', example: DocumentType.CPF, enum: DocumentType })
  @Expose()
  documentType: DocumentType

  @ApiProperty({ description: 'User document number', example: '12345678900' })
  @Expose()
  document: string

  @ApiProperty({ description: 'User birth date', example: '1990-01-01' })
  @Expose()
  birthDate: string

  @ApiProperty({ description: 'User phone number', example: '12345678900' })
  @Expose()
  phoneNumber?: string

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
