export function isAtLeastAge(birthDate: string | Date, minimumAge: number, today: Date = new Date()): boolean {
  const birth = new Date(birthDate)
  const threshold = new Date(birth)
  threshold.setFullYear(birth.getFullYear() + minimumAge)
  return today >= threshold
}
