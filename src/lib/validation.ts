import type { ApiError } from './api'

export type FieldErrors = Record<string, string[]>

export function getFieldErrors(err: unknown): FieldErrors | null {
  const e = err as ApiError
  const d = e?.details
  if (!d || typeof d !== 'object') return null
  if (Array.isArray(d)) return null

  const obj = d as Record<string, unknown>
  const out: FieldErrors = {}
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') out[k] = [v]
    else if (Array.isArray(v)) out[k] = v.map(String)
  }
  return Object.keys(out).length ? out : null
}

export function firstFieldError(errors: FieldErrors | null, key: string): string | null {
  const v = errors?.[key]
  if (!v?.length) return null
  return v[0] ?? null
}

