import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString, Length } from 'class-validator'
import { PaginationMetaDto } from '~/common/pagination/pagination.dto'

export enum PixType {
  CPF = 'cpf',
  CNPJ = 'cnpj',
  EMAIL = 'email',
  PHONE = 'phone',
  RANDOM = 'random',
}

export class CreateOrganizerPaymentInfoDto {
  @ApiProperty({ description: 'Description of the payment info', type: String, example: 'Main bank account' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  description!: string

  @ApiProperty({
    description: 'Bank branch number',
    type: String,
    example: '1234',
    minLength: 4,
    maxLength: 4,
    required: false,
  })
  @IsNumberString()
  @Length(4, 4)
  @IsOptional()
  @Expose()
  branchNumber?: string

  @ApiProperty({
    description: 'Bank branch digit',
    type: String,
    example: '5',
    minLength: 1,
    maxLength: 1,
    required: false,
  })
  @IsNumberString()
  @Length(1, 1)
  @IsOptional()
  @Expose()
  branchDigit?: string

  @ApiProperty({
    description: 'Bank account number',
    type: String,
    example: '1234567890',
    minLength: 5,
    maxLength: 10,
    required: false,
  })
  @IsNumberString()
  @Length(5, 10)
  @IsOptional()
  @Expose()
  accountNumber?: string

  @ApiProperty({
    description: 'Bank account digit',
    type: String,
    example: '5',
    minLength: 1,
    maxLength: 1,
    required: false,
  })
  @IsNumberString()
  @Length(1, 1)
  @IsOptional()
  @Expose()
  accountDigit?: string

  @ApiProperty({ description: 'Pix key', type: String, example: '1234567890', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  pixKey?: string

  @ApiProperty({ description: 'Pix type', enum: PixType, example: 'cpf', required: false })
  @IsEnum(PixType)
  @IsOptional()
  @Expose()
  pixType?: PixType

  @ApiProperty({
    description: 'Bank code',
    type: String,
    example: '260',
    minLength: 3,
    maxLength: 3,
    required: false,
  })
  @IsNumberString()
  @Length(3, 3)
  @IsOptional()
  @Expose()
  bankCode?: string
}

export class UpdateOrganizerPaymentInfoDto extends PartialType(CreateOrganizerPaymentInfoDto) {}

export class OrganizerPaymentInfoDataDto extends CreateOrganizerPaymentInfoDto {
  @ApiProperty({
    description: 'Organizer payment info ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id!: string

  @ApiProperty({
    description: 'User ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  userId!: string
}

export class OrganizerPaymentInfoResDto {
  @ApiProperty({ description: 'Organizer payment info', type: OrganizerPaymentInfoDataDto })
  data!: OrganizerPaymentInfoDataDto
}

export class ListOrganizerPaymentInfoDto {
  @ApiProperty({
    description: 'Organizer payment info ID',
    type: String,
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({ description: 'Description of the payment info', type: String, example: 'Main bank account' })
  description!: string
}

export class OrganizerPaymentInfoPageDto {
  @ApiProperty({ description: 'Organizer payment info list', type: [ListOrganizerPaymentInfoDto] })
  data!: ListOrganizerPaymentInfoDto[]

  @ApiProperty({ description: 'Pagination meta', type: PaginationMetaDto })
  meta!: PaginationMetaDto
}
