import { createHash, timingSafeEqual } from 'crypto'

export function validateWebhookSignature(token: string, rawBody: string, signature: string): boolean {
  const expected = createHash('sha256').update(`${token}-${rawBody}`).digest('hex')

  const expectedBuffer = Buffer.from(expected, 'utf8')
  const signatureBuffer = Buffer.from(signature, 'utf8')

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer)
}
