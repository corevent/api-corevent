import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsIn, IsNotEmpty, IsString, IsUUID, ValidateIf } from 'class-validator'
import { ALLOWED_IMAGE_CONTENT_TYPES } from '~/modules/storage/constants/storage.constants'

export enum StorageUploadPurpose {
  AVATAR = 'avatar',
  EVENT_BANNER = 'event_banner',
}

export class PresignUploadDto {
  @ApiProperty({ description: 'The purpose of the upload', enum: StorageUploadPurpose })
  @IsEnum(StorageUploadPurpose)
  purpose: StorageUploadPurpose

  @ApiProperty({ description: 'The content type of the upload' })
  @IsIn(ALLOWED_IMAGE_CONTENT_TYPES)
  contentType: string

  @ValidateIf((dto: PresignUploadDto) => dto.purpose === StorageUploadPurpose.EVENT_BANNER)
  @IsUUID()
  @IsNotEmpty()
  eventId?: string
}

export class PresignUploadDataDto {
  @ApiProperty({ description: 'The presigned upload URL' })
  uploadUrl: string

  @ApiProperty({ description: 'The key of the uploaded object' })
  key: string

  @ApiProperty({ description: 'The public URL of the uploaded object' })
  publicUrl: string

  @ApiProperty({ description: 'The expiration time of the presigned upload URL' })
  expiresIn: number
}

export class PresignUploadResponseDto {
  @ApiProperty({ description: 'The data of the presigned upload' })
  data: PresignUploadDataDto
}

export class ConfirmImageUploadDto {
  @ApiProperty({ description: 'S3 object key returned from the presign endpoint' })
  @IsNotEmpty()
  @IsString()
  key: string
}
