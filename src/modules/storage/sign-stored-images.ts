const IMAGE_URL_FIELDS = new Set(['avatarUrl', 'bannerUrl'])

export function isStoredObjectKey(value: string): boolean {
  return value.startsWith('avatars/') || value.startsWith('events/')
}

export async function signStoredImages<T>(payload: T, signKey: (key: string) => Promise<string>): Promise<T> {
  const copy = cloneForResponse(payload)
  await visit(copy, signKey, new WeakSet<object>())
  return copy
}

function cloneForResponse<T>(payload: T): T {
  if (payload === undefined || payload === null || typeof payload !== 'object') {
    return payload
  }
  try {
    return JSON.parse(JSON.stringify(payload)) as T
  } catch {
    return payload
  }
}

async function visit(value: unknown, signKey: (key: string) => Promise<string>, seen: WeakSet<object>): Promise<void> {
  if (typeof value !== 'object' || value === null || seen.has(value)) {
    return
  }
  seen.add(value)
  if (Array.isArray(value)) {
    await Promise.all(value.map((item) => visit(item, signKey, seen)))
    return
  }
  if (!isPlainRecord(value)) {
    return
  }
  await visitRecord(value, signKey, seen)
}

function isPlainRecord(value: object): value is Record<string, unknown> {
  return !Array.isArray(value)
}

async function visitRecord(
  record: Record<string, unknown>,
  signKey: (key: string) => Promise<string>,
  seen: WeakSet<object>,
): Promise<void> {
  const entries = Object.entries(record)
  await Promise.all(entries.map(([field, fieldValue]) => visitField(record, field, fieldValue, signKey, seen)))
}

async function visitField(
  record: Record<string, unknown>,
  field: string,
  fieldValue: unknown,
  signKey: (key: string) => Promise<string>,
  seen: WeakSet<object>,
): Promise<void> {
  if (IMAGE_URL_FIELDS.has(field) && typeof fieldValue === 'string' && isStoredObjectKey(fieldValue)) {
    record[field] = await signKey(fieldValue)
    return
  }
  await visit(fieldValue, signKey, seen)
}
