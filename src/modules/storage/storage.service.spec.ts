import { Storage } from '@google-cloud/storage'
import { BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventsService } from '~/modules/events-module/events.service'
import { StorageUploadPurpose } from '~/modules/storage/dto/storage.dto'
import { StorageService } from '~/modules/storage/storage.service'

interface StorageFileMock {
  getSignedUrl: jest.Mock<Promise<[string]>, [Record<string, unknown>]>
  exists: jest.Mock<Promise<[boolean]>, []>
  delete: jest.Mock<Promise<void>, [{ ignoreNotFound: boolean }]>
}

describe('StorageService', () => {
  const userId = 'user-1'
  const eventId = 'event-1'
  let file: StorageFileMock
  let eventsService: { assertUserIsOrganizer: jest.Mock<Promise<void>, [string, string]> }
  let service: StorageService

  beforeEach(() => {
    file = {
      getSignedUrl: jest.fn().mockResolvedValue(['https://signed.example/object']),
      exists: jest.fn().mockResolvedValue([true]),
      delete: jest.fn().mockResolvedValue(undefined),
    }
    const storage = {
      bucket: jest.fn().mockReturnValue({
        file: jest.fn().mockReturnValue(file),
      }),
    } as unknown as Storage
    eventsService = { assertUserIsOrganizer: jest.fn().mockResolvedValue(undefined) }
    const configService = {
      get: (key: string): string | undefined => (key === 'GCS_BUCKET' ? 'corevent' : undefined),
    } as unknown as ConfigService

    service = new StorageService(configService, storage, eventsService as unknown as EventsService)
  })

  it('returns a signed upload URL and stores the object key for an avatar', async () => {
    const result = await service.presignUpload(userId, {
      purpose: StorageUploadPurpose.AVATAR,
      contentType: 'image/png',
    })

    expect(result.data.key).toMatch(new RegExp(`^avatars/${userId}/.+\.png$`))
    expect(result.data.uploadUrl).toBe('https://signed.example/object')
    expect(result.data.expiresIn).toBe(600)
    expect(file.getSignedUrl).toHaveBeenCalledWith(
      expect.objectContaining({ version: 'v4', action: 'write', contentType: 'image/png' }),
    )
    expect(file.getSignedUrl).toHaveBeenCalledWith(expect.objectContaining({ version: 'v4', action: 'read' }))
  })

  it('rejects an unsupported image content type', async () => {
    await expect(
      service.presignUpload(userId, { purpose: StorageUploadPurpose.AVATAR, contentType: 'image/gif' }),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('requires the organizer check before signing an event banner upload', async () => {
    const result = await service.presignUpload(userId, {
      purpose: StorageUploadPurpose.EVENT_BANNER,
      contentType: 'image/jpeg',
      eventId,
    })

    expect(eventsService.assertUserIsOrganizer).toHaveBeenCalledWith(userId, eventId)
    expect(result.data.key).toMatch(new RegExp(`^events/${eventId}/banner/.+\\.jpg$`))
  })

  it('returns the object key only after the uploaded avatar exists', async () => {
    const key = `avatars/${userId}/file.png`

    await expect(service.confirmAvatarUpload(userId, key)).resolves.toBe(key)
    file.exists.mockResolvedValue([false])
    await expect(service.confirmAvatarUpload(userId, key)).rejects.toThrow('Uploaded image not found in storage')
    await expect(service.confirmAvatarUpload(userId, 'avatars/other-user/file.png')).rejects.toThrow(
      'Invalid avatar upload key',
    )
  })

  it('returns the banner key only when it belongs to the event and the file exists', async () => {
    const key = `events/${eventId}/banner/file.jpg`

    await expect(service.confirmEventBannerUpload(eventId, key)).resolves.toBe(key)
    file.exists.mockResolvedValue([false])
    await expect(service.confirmEventBannerUpload(eventId, key)).rejects.toThrow('Uploaded image not found in storage')
    await expect(service.confirmEventBannerUpload(eventId, 'events/other-event/banner/file.jpg')).rejects.toThrow(
      'Invalid event banner upload key',
    )
  })

  it('deletes a stored object key and ignores external URLs', async () => {
    await service.deleteStoredImage('https://corevent.com/avatar.png')
    await service.deleteStoredImage(`avatars/${userId}/file.png`)

    expect(file.delete).toHaveBeenCalledTimes(1)
    expect(file.delete).toHaveBeenCalledWith({ ignoreNotFound: true })
  })
})
