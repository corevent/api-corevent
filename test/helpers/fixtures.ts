export const STRONG_PASSWORD = '@Password123'
export const WEAK_PASSWORD = 'password'
export const WRONG_PASSWORD = '@WrongPass1'
export const DEFAULT_VERIFY_CODE = '000000'

export function errorText(body: { message?: string | string[] }): string {
  if (Array.isArray(body.message)) {
    return body.message.join(' ')
  }
  return body.message ?? ''
}

export function daysFromNow(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

export function verifyEmailCode(): string {
  return process.env.ADMIN_VERIFICATION_CODE || DEFAULT_VERIFY_CODE
}

let sequence = 0

export function uniqueSuffix(): string {
  sequence += 1
  return `${Date.now()}${sequence}${Math.floor(Math.random() * 1000)}`
}

export function generateValidCpf(): string {
  for (let attempt = 0; attempt < 10; attempt++) {
    const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
    if (digits.every((digit) => digit === digits[0])) {
      continue
    }

    const firstDigit = cpfCheckDigit(digits, 10)
    const secondDigit = cpfCheckDigit([...digits, firstDigit], 11)
    return [...digits, firstDigit, secondDigit].join('')
  }

  throw new Error('Unable to generate a valid CPF')
}

function cpfCheckDigit(digits: number[], factor: number): number {
  let sum = 0
  for (const digit of digits) {
    sum += digit * factor
    factor -= 1
  }
  const remainder = (sum * 10) % 11
  return remainder === 10 ? 0 : remainder
}
