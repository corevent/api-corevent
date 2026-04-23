function clearNumber(number: string): string {
  return number.replace(/\D/g, '')
}

export function validateCelphone(number: string): boolean {
  const num = clearNumber(number)

  // Remove +55 (Brazil) if it comes
  const numWithoutDDI = num.startsWith('55') ? num.slice(2) : num

  // It must have 11 digits (DDD + 9 digits)
  if (numWithoutDDI.length !== 11) return false

  const ddd = numWithoutDDI.slice(0, 2)
  const firstDigit = numWithoutDDI[2]

  // DDD cannot start with 0
  if (ddd.startsWith('0')) return false

  // Brazilian celphone always starts with 9
  if (firstDigit !== '9') return false

  return true
}
