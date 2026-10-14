import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

export function encryptQrToken(token: string, secret: string): string {
  const key = createHash('sha256').update(secret).digest()
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`
}

export function decryptQrToken(encryptedToken: string, secret: string): string {
  const [ivBase64, authTagBase64, encryptedBase64] = encryptedToken.split(':')
  if (!ivBase64 || !authTagBase64 || !encryptedBase64) {
    throw new Error('Invalid QR code encrypted token format')
  }

  const key = createHash('sha256').update(secret).digest()
  const iv = Buffer.from(ivBase64, 'base64')
  const authTag = Buffer.from(authTagBase64, 'base64')
  const encrypted = Buffer.from(encryptedBase64, 'base64')
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}
