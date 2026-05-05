import { ApiProperty } from '@nestjs/swagger'
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
  @ApiProperty({ description: 'Description of the payment info', example: 'Main bank account' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  description: string

  @ApiProperty({ description: 'Bank branch number', example: '1234', required: false })
  @IsNumberString()
  @Length(4, 4)
  @IsOptional()
  @Expose()
  branchNumber?: string

  @ApiProperty({ description: 'Bank branch digit', example: '5', required: false })
  @IsNumberString()
  @Length(1, 1)
  @IsOptional()
  @Expose()
  branchDigit?: string

  @ApiProperty({ description: 'Bank account number', example: '1234567890', required: false })
  @IsNumberString()
  @Length(5, 10)
  @IsOptional()
  @Expose()
  accountNumber?: string

  @ApiProperty({ description: 'Bank account digit', example: '5', required: false })
  @IsNumberString()
  @Length(1, 1)
  @IsOptional()
  @Expose()
  accountDigit?: string

  @ApiProperty({ description: 'Pix key', example: '1234567890', required: false })
  @IsString()
  @IsOptional()
  @Expose()
  pixKey?: string

  @ApiProperty({ description: 'Pix type', example: 'cpf', enum: PixType, required: false })
  @IsEnum(PixType)
  @IsOptional()
  @Expose()
  pixType?: PixType

  @ApiProperty({ description: 'Bank code', example: '260', required: false })
  @IsNumberString()
  @Length(3, 3)
  @IsOptional()
  @Expose()
  bankCode?: string
}

export class DataOrganizerPaymentInfoDto extends CreateOrganizerPaymentInfoDto {
  @ApiProperty({ description: 'Organizer payment info ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string

  @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  userId: string
}

export class ResOrganizerPaymentInfoDto {
  @ApiProperty({ description: 'Organizer payment info', type: DataOrganizerPaymentInfoDto })
  data: DataOrganizerPaymentInfoDto
}

export class ListOrganizerPaymentInfoDto {
  @ApiProperty({ description: 'Organizer payment info ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ description: 'Description of the payment info', example: 'Main bank account' })
  description: string
}

export class OrganizerPaymentInfoPageDto {
  @ApiProperty({ description: 'Organizer payment info list', type: [ListOrganizerPaymentInfoDto] })
  data: ListOrganizerPaymentInfoDto[]

  @ApiProperty({ description: 'Pagination meta', type: PaginationMetaDto })
  meta: PaginationMetaDto
}
