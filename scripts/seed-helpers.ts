const metadata = new Set(['id', 'createdAt', 'updatedAt', '_status', 'globalType'])
const plainObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

/** Defaults and metadata alone do not mean an editor has written content. */
export function hasEditorialContent(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.some(hasEditorialContent)
  if (plainObject(value))
    return Object.entries(value).some(([key, item]) => !metadata.has(key) && hasEditorialContent(item))
  return value !== null && value !== undefined
}

/**
 * Missing text/nested fields may be filled; populated values and editor-owned
 * arrays (including deliberately cleared arrays) are never replaced.
 */
export function missingDefaults<T extends object>(
  existing: unknown,
  defaults: T,
  { initialize = false } = {},
): Partial<T> {
  const current = plainObject(existing) ? existing : {}
  const patch: Record<string, unknown> = {}
  for (const [key, fallback] of Object.entries(defaults)) {
    if (metadata.has(key)) continue
    const value = current[key]
    if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
      patch[key] = structuredClone(fallback)
    } else if (initialize && Array.isArray(value) && value.length === 0) {
      patch[key] = structuredClone(fallback)
    } else if (plainObject(value) && plainObject(fallback)) {
      const child = missingDefaults(value, fallback, { initialize })
      if (Object.keys(child).length) patch[key] = { ...value, ...child }
    }
  }
  return patch as Partial<T>
}
