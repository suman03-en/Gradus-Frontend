export type ApiError = {
  status: number
  message: string
  details?: unknown
}

/**
 * Cache configuration for API calls.
 * Set enableCache to true to cache GET requests.
 */
export type ApiCacheOptions = {
  enableCache?: boolean
  ttlSeconds?: number
  cacheKey?: string
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
  
  // Prioritize certain keys for common error responses (like Django's non_field_errors or detail)
  const priorityKeys = ['non_field_errors', 'detail', 'message', 'error']
  for (const key of priorityKeys) {
    const v = obj[key]
    if (typeof v === 'string') return v
    if (Array.isArray(v) && v.length && typeof v[0] === 'string') return v[0]
  }

  // Fallback to searching all keys
  for (const key of Object.keys(obj)) {
    const v = obj[key]
    if (typeof v === 'string') return v
    if (Array.isArray(v) && v.length && typeof v[0] === 'string') {
      // If it's the standard Django non_field_errors, just return the value.
      // Otherwise, prefix with the field name.
      return key === 'non_field_errors' ? v[0] : `${key}: ${v[0]}`
    }
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
    cache?: ApiCacheOptions
  },
): Promise<T> {
  // Handle caching for GET requests
  if (opts?.cache?.enableCache) {
    const { localCache, CACHE_TTL } = await import('./cache')
    const method = (opts?.method ?? 'GET').toUpperCase()
    
    if (method === 'GET') {
      const cacheKey = opts.cache.cacheKey || path
      const ttl = opts.cache.ttlSeconds ?? CACHE_TTL.MEDIUM
      
      // Try to get from cache
      const cached = localCache.get<T>(cacheKey)
      if (cached !== null) {
        return cached
      }
      
      // Fetch and cache
      const data = await apiFetchJson<T>(path, opts)
      localCache.set(cacheKey, data, ttl)
      return data
    }
  }

  // Non-cached request
  return apiFetchJson<T>(path, opts)
}

async function apiFetchJson<T>(
  path: string,
  opts?: {
    method?: string
    body?: unknown
    headers?: Record<string, string>
    cache?: ApiCacheOptions
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
    credentials: 'omit',
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
    credentials: 'omit',
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '')

  if (!res.ok) throw buildError(res, payload)

  return payload as T
}

export async function apiBlob(
  path: string,
  opts?: {
    method?: string
    headers?: Record<string, string>
  },
): Promise<{ blob: Blob; contentDisposition: string | null }> {
  const method = (opts?.method ?? 'GET').toUpperCase()
  const headers: Record<string, string> = {
    ...(opts?.headers ?? {}),
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Token ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'omit',
  })

  if (!res.ok) {
    const contentType = res.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '')
    throw buildError(res, payload)
  }

  const blob = await res.blob()
  const contentDisposition = res.headers.get('content-disposition')
  return { blob, contentDisposition }
}

export class BuildError extends Error implements ApiError {
  status: number
  message: string
  details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.message = message
    this.details = details
    this.name = 'BuildError'
  }
}

function buildError(res: Response, payload: any): BuildError {
  const status = res.status
  const message = userFriendlyHttpMessage(status) || extractFirstValidationMessage(payload) || 'An unexpected error occurred.'
  return new BuildError(status, message, payload)
}
