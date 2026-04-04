/**
 * Validation utilities
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export function sanitizeString(str: string, maxLength: number = 500): string {
  return str.trim().slice(0, maxLength)
}

export function isValidYear(year: number): boolean {
  return !isNaN(year) && year >= 2000 && year <= 2100
}

export function isValidAmount(amount: any): boolean {
  const num = Number(amount)
  return !isNaN(num) && num >= 0 && num <= 999999
}

export function isValidFrequency(frequency: string): boolean {
  return ['monthly', 'quarterly', 'semiannual', 'annual'].includes(frequency)
}

export function isValidDocumentType(type: string): boolean {
  return ['contract', 'invoice', 'other'].includes(type)
}

export function isValidReminderStatus(status: string): boolean {
  return ['pending', 'done', 'dismissed'].includes(status)
}

export function isValidApartmentStatus(status: string): boolean {
  return ['occupied', 'vacant'].includes(status)
}
