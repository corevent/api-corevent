export const ALLOWED_IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export type AllowedImageContentType = (typeof ALLOWED_IMAGE_CONTENT_TYPES)[number]

export const PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS = 600

export const CONTENT_TYPE_TO_EXTENSION: Record<AllowedImageContentType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
