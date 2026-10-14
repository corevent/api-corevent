import { isStoredObjectKey, signStoredImages } from '~/modules/storage/sign-stored-images'

describe('signStoredImages', () => {
  const signKey = (key: string): Promise<string> => Promise.resolve(`https://signed.example/${key}`)

  it('signs avatar and banner keys nested in the response', async () => {
    const payload = {
      data: [
        {
          bannerUrl: 'events/event-1/banner/file.jpg',
          organizer: { avatarUrl: 'avatars/user-1/file.png' },
          key: 'avatars/user-1/file.png',
        },
      ],
    }

    const signed = await signStoredImages(payload, signKey)

    expect(signed.data[0]?.bannerUrl).toBe('https://signed.example/events/event-1/banner/file.jpg')
    expect(signed.data[0]?.organizer.avatarUrl).toBe('https://signed.example/avatars/user-1/file.png')
    expect(signed.data[0]?.key).toBe('avatars/user-1/file.png')
  })

  it('leaves external image URLs unchanged and does not mutate the input', async () => {
    const payload = { data: { avatarUrl: 'https://corevent.com/avatar.png' } }

    const signed = await signStoredImages(payload, signKey)

    expect(signed.data.avatarUrl).toBe('https://corevent.com/avatar.png')
    expect(payload.data.avatarUrl).toBe('https://corevent.com/avatar.png')
  })

  it('recognizes only object keys stored by this API', () => {
    expect(isStoredObjectKey('avatars/user-1/file.jpg')).toBe(true)
    expect(isStoredObjectKey('events/event-1/banner/file.jpg')).toBe(true)
    expect(isStoredObjectKey('https://storage.googleapis.com/corevent/avatars/user-1/file.jpg')).toBe(false)
  })
})
