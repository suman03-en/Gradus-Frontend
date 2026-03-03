export type ApiError = {
  status: number
  message: string
  details?: unknown
}

function userFriendlyHttpMessage(status: number): string | null {
  if (status === 401) return 'Please login first to continue.'
  if (status === 403) return 'You are not allowed to view this or perform this action.'
  if (status === 404) return 'Not found.'
  if (status === 405) return 'This action is not allowed.'
  return null
}

function extractFirstValidationMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const obj = payload as Record<string, unknown>
  for (const key of Object.keys(obj)) {
    const v = obj[key]
    if (typeof v === 'string') return v
    if (Array.isArray(v) && v.length && typeof v[0] === 'string') return `${key}: ${v[0]}`
  }
  return null
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const TOKEN_KEY = 'gradus_auth_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

function getCookie(name: string): string | null {
  const parts = document.cookie.split(';').map((p) => p.trim())
  const hit = parts.find((p) => p.startsWith(`${name}=`))
  if (!hit) return null
  return decodeURIComponent(hit.substring(name.length + 1))
}

export async function apiJson<T>(
  path: string,
  opts?: {
    method?: string
    body?: unknown
    headers?: Record<string, string>
  },
): Promise<T> {
  const method = (opts?.method ?? 'GET').toUpperCase()

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts?.headers ?? {}),
  }
  if (opts?.body !== undefined) headers['Content-Type'] = 'application/json'
  
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Token ${token}`
  }
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: opts?.body === undefined ? undefined : JSON.stringify(opts.body),
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '')

  if (!res.ok) throw buildError(res, payload)

  return payload as T
}

/**
 * Post multipart/form-data (for file uploads).
 * Does NOT set Content-Type — the browser auto-sets it with the boundary.
 */
export async function apiFormData<T>(
  path: string,
  formData: FormData,
  opts?: { method?: string },
): Promise<T> {
  const method = (opts?.method ?? 'POST').toUpperCase()

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Token ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: formData,
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '')

  if (!res.ok) throw buildError(res, payload)

  return payload as T
}
