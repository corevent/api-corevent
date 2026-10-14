import { File, Storage } from '@google-cloud/storage'
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'node:crypto'
import { EventsService } from '~/modules/events-module/events.service'
import {
  ALLOWED_IMAGE_CONTENT_TYPES,
  AllowedImageContentType,
  CONTENT_TYPE_TO_EXTENSION,
  PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS,
  SIGNED_READ_EXPIRES_IN_SECONDS,
} from '~/modules/storage/constants/storage.constants'
import { PresignUploadDto, PresignUploadResponseDto, StorageUploadPurpose } from '~/modules/storage/dto/storage.dto'
import { PresignedUploadResult } from '~/modules/storage/interfaces/storage.interface'
import { isStoredObjectKey, signStoredImages } from '~/modules/storage/sign-stored-images'
import { STORAGE_CLIENT } from '~/modules/storage/storage.client'

@Injectable()
export class StorageService {
  private readonly bucketName: string

  constructor(
    private readonly configService: ConfigService,
    @Inject(STORAGE_CLIENT) private readonly storage: Storage,
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
  ) {
    this.bucketName = this.getRequiredEnv('GCS_BUCKET')
  }

  async presignUpload(userId: string, dto: PresignUploadDto): Promise<PresignUploadResponseDto> {
    this.assertAllowedContentType(dto.contentType)
    const contentType = dto.contentType
    const key = await this.resolveUploadKey(userId, dto, contentType)
    const { uploadUrl, expiresIn } = await this.getPresignedUploadUrl(key, contentType)

    return {
      data: {
        uploadUrl,
        key,
        publicUrl: await this.getSignedReadUrl(key),
        expiresIn,
      },
    }
  }

  async signResponseImages<T>(payload: T): Promise<T> {
    return signStoredImages(payload, (key) => this.getSignedReadUrl(key))
  }

  async confirmAvatarUpload(userId: string, key: string): Promise<string> {
    if (!this.isAvatarKeyOwnedByUser(key, userId)) {
      throw new BadRequestException('Invalid avatar upload key')
    }
    await this.assertObjectExists(key)
    return key
  }

  async confirmEventBannerUpload(eventId: string, key: string): Promise<string> {
    if (!this.isEventBannerKeyForEvent(key, eventId)) {
      throw new BadRequestException('Invalid event banner upload key')
    }
    await this.assertObjectExists(key)
    return key
  }

  async deleteStoredImage(stored?: string | null): Promise<void> {
    if (!stored || !isStoredObjectKey(stored)) {
      return
    }
    await this.file(stored).delete({ ignoreNotFound: true })
  }

  private assertAllowedContentType(contentType: string): asserts contentType is AllowedImageContentType {
    if (!ALLOWED_IMAGE_CONTENT_TYPES.includes(contentType as AllowedImageContentType)) {
      throw new BadRequestException('Unsupported image content type')
    }
  }

  private buildAvatarKey(userId: string, contentType: AllowedImageContentType): string {
    const extension = CONTENT_TYPE_TO_EXTENSION[contentType]
    return `avatars/${userId}/${randomUUID()}.${extension}`
  }

  private buildEventBannerKey(eventId: string, contentType: AllowedImageContentType): string {
    const extension = CONTENT_TYPE_TO_EXTENSION[contentType]
    return `events/${eventId}/banner/${randomUUID()}.${extension}`
  }

  private async getPresignedUploadUrl(
    key: string,
    contentType: AllowedImageContentType,
  ): Promise<PresignedUploadResult> {
    const [uploadUrl] = await this.file(key).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS * 1000,
      contentType,
    })

    return { uploadUrl, expiresIn: PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS }
  }

  private async getSignedReadUrl(key: string): Promise<string> {
    const expires = Date.now() + SIGNED_READ_EXPIRES_IN_SECONDS * 1000
    const [url] = await this.file(key).getSignedUrl({ version: 'v4', action: 'read', expires })
    return url
  }

  private isAvatarKeyOwnedByUser(key: string, userId: string): boolean {
    return key.startsWith(`avatars/${userId}/`)
  }

  private isEventBannerKeyForEvent(key: string, eventId: string): boolean {
    return key.startsWith(`events/${eventId}/banner/`)
  }

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

  private async assertObjectExists(key: string): Promise<void> {
    const [exists] = await this.file(key).exists()
    if (!exists) {
      throw new BadRequestException('Uploaded image not found in storage')
    }
  }

  private file(key: string): File {
    return this.storage.bucket(this.bucketName).file(key)
  }

  private getRequiredEnv(key: string): string {
    const value = this.configService.get<string>(key)
    if (!value) {
      throw new Error(`Environment variable ${key} is required`)
    }
    return value
  }
}
