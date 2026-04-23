type AnyObject = Record<string, unknown>

function isPlainObject(value: unknown): value is AnyObject {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function hasValueInternal(value: unknown, visited: WeakSet<object>): boolean {
  if (value === null || value === undefined) {
    return false
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
  }

  if (typeof value === 'boolean' || typeof value === 'bigint' || typeof value === 'symbol') {
    return true
  }

  if (value instanceof Date) {
    return !Number.isNaN(value.getTime())
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasValueInternal(item, visited))
  }

  if (isPlainObject(value)) {
    if (visited.has(value)) {
      return false
    }

    visited.add(value)
    return Object.values(value).some((nestedValue) => hasValueInternal(nestedValue, visited))
  }

  return true
}

export function hasValue(value: unknown): boolean {
  return hasValueInternal(value, new WeakSet<object>())
}
