import { DeleteObjectCommand, HeadObjectCommand, NotFound, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import {
  ALLOWED_IMAGE_CONTENT_TYPES,
  AllowedImageContentType,
  CONTENT_TYPE_TO_EXTENSION,
  PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS,
} from '~/modules/storage/constants/storage.constants'
import { EventsService } from '~/modules/events-module/events.service'
import { PresignUploadDto, PresignUploadResponseDto, StorageUploadPurpose } from '~/modules/storage/dto/storage.dto'
import { PresignedUploadResult } from '~/modules/storage/interfaces/storage.interface'

@Injectable()
export class StorageService {
  private readonly s3: S3Client
  private readonly bucket: string
  private readonly region: string

  constructor(
    private readonly configService: ConfigService,
    private readonly eventsService: EventsService,
  ) {
    const accessKeyId = this.getRequiredEnv('AWS_ACCESS_KEY_ID')
    const secretAccessKey = this.getRequiredEnv('AWS_SECRET_ACCESS_KEY')
    this.region = this.getRequiredEnv('AWS_REGION')
    this.bucket = this.getRequiredEnv('AWS_S3_BUCKET')

    this.s3 = new S3Client({
      region: this.region,
      credentials: { accessKeyId, secretAccessKey },
    })
  }

  // Orchestrates presigned upload URL generation for avatar or event banner uploads.
  async presignUpload(userId: string, dto: PresignUploadDto): Promise<PresignUploadResponseDto> {
    this.assertAllowedContentType(dto.contentType)
    const contentType = dto.contentType
    const key = await this.resolveUploadKey(userId, dto, contentType)
    const { uploadUrl, expiresIn } = await this.getPresignedUploadUrl(key, contentType)

    return {
      data: {
        uploadUrl,
        key,
        publicUrl: this.buildPublicUrl(key),
        expiresIn,
      },
    }
  }

  // Validates that the provided MIME type is an allowed image format.
  assertAllowedContentType(contentType: string): asserts contentType is AllowedImageContentType {
    if (!ALLOWED_IMAGE_CONTENT_TYPES.includes(contentType as AllowedImageContentType)) {
      throw new BadRequestException('Unsupported image content type')
    }
  }

  // Builds the S3 object key for a user avatar upload.
  buildAvatarKey(userId: string, contentType: AllowedImageContentType): string {
    const extension = CONTENT_TYPE_TO_EXTENSION[contentType]
    return `avatars/${userId}/${randomUUID()}.${extension}`
  }

  // Builds the S3 object key for an event banner upload.
  buildEventBannerKey(eventId: string, contentType: AllowedImageContentType): string {
    const extension = CONTENT_TYPE_TO_EXTENSION[contentType]
    return `events/${eventId}/banner/${randomUUID()}.${extension}`
  }

  // Generates a temporary presigned PUT URL so the client can upload directly to S3.
  async getPresignedUploadUrl(key: string, contentType: AllowedImageContentType): Promise<PresignedUploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS,
    })

    return { uploadUrl, expiresIn: PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS }
  }

  // Builds the permanent public URL for an object stored in the bucket.
  buildPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
  }

  // Checks whether an object exists in the bucket (used to confirm uploads).
  async objectExists(key: string): Promise<boolean> {
    try {
      await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }))
      return true
    } catch (error) {
      if (error instanceof NotFound) {
        return false
      }
      throw error
    }
  }

  // Removes an object from the bucket (e.g. when replacing an old image).
  async deleteObject(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
  }

  // Extracts the S3 object key from a public URL previously stored in the database.
  extractKeyFromPublicUrl(publicUrl: string): string | null {
    const prefix = `https://${this.bucket}.s3.${this.region}.amazonaws.com/`
    if (!publicUrl.startsWith(prefix)) {
      return null
    }
    return publicUrl.slice(prefix.length)
  }

  // Ensures the object key belongs to the given user (prevents cross-user key reuse).
  isAvatarKeyOwnedByUser(key: string, userId: string): boolean {
    return key.startsWith(`avatars/${userId}/`)
  }

  // Ensures the object key belongs to the given event (prevents cross-event key reuse).
  isEventBannerKeyForEvent(key: string, eventId: string): boolean {
    return key.startsWith(`events/${eventId}/banner/`)
  }

  // Resolves the S3 object key based on upload purpose and validates access when required.
  private async resolveUploadKey(
    userId: string,
    dto: PresignUploadDto,
    contentType: AllowedImageContentType,
  ): Promise<string> {
    if (dto.purpose === StorageUploadPurpose.AVATAR) {
      return this.buildAvatarKey(userId, contentType)
    }

    if (!dto.eventId) {
      throw new BadRequestException('eventId is required for event banner uploads')
    }

    await this.eventsService.assertUserIsOrganizer(userId, dto.eventId)
    return this.buildEventBannerKey(dto.eventId, contentType)
  }

  // Reads a required environment variable or throws at startup if missing.
  private getRequiredEnv(key: string): string {
    const value = this.configService.get<string>(key)
    if (!value) {
      throw new Error(`Environment variable ${key} is required`)
    }
    return value
  }
}
