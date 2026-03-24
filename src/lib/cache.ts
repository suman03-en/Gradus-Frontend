/**
 * Frontend caching utilities using browser localStorage and sessionStorage.
 * Implements intelligent caching for API responses and user data.
 */

export type CacheStorageType = 'localStorage' | 'sessionStorage'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

/**
 * Cache manager for browser storage.
 * Handles expiration, versioning, and type safety.
 */
export class CacheManager {
  private static readonly VERSION = 'v1'
  private static readonly STORAGE_PREFIX = 'gradus_cache'

  constructor(private storageType: CacheStorageType = 'localStorage') {}

  /**
   * Get storage instance.
   */
  private getStorage(): Storage {
    if (this.storageType === 'sessionStorage') {
      return typeof window !== 'undefined' ? window.sessionStorage : ({} as Storage)
    }
    return typeof window !== 'undefined' ? window.localStorage : ({} as Storage)
  }

  /**
   * Generate cache key with version and prefix.
   */
  private generateKey(key: string): string {
    return `${CacheManager.STORAGE_PREFIX}:${CacheManager.VERSION}:${key}`
  }

  /**
   * Set cache entry with expiration time.
   */
  set<T>(key: string, data: T, ttlSeconds: number = 3600): void {
    try {
      const storage = this.getStorage()
      const now = Date.now()
      const expiresAt = now + ttlSeconds * 1000

      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        expiresAt,
      }

      storage.setItem(this.generateKey(key), JSON.stringify(entry))
    } catch (error) {
      // Silently fail if storage is full or unavailable
      console.warn(`[CacheManager] Failed to set key "${key}":`, error)
    }
  }

  /**
   * Get cache entry if not expired.
   */
  get<T>(key: string): T | null {
    try {
      const storage = this.getStorage()
      const item = storage.getItem(this.generateKey(key))

      if (!item) return null

      const entry: CacheEntry<T> = JSON.parse(item)
      const now = Date.now()

      // Check if expired
      if (now > entry.expiresAt) {
        storage.removeItem(this.generateKey(key))
        return null
      }

      return entry.data
    } catch (error) {
      // Silently fail if parsing fails
      console.warn(`[CacheManager] Failed to get key "${key}":`, error)
      return null
    }
  }

  /**
   * Get or set cache entry.
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetchFn()
    this.set(key, data, ttlSeconds)
    return data
  }

  /**
   * Delete cache entry.
   */
  delete(key: string): void {
    try {
      const storage = this.getStorage()
      storage.removeItem(this.generateKey(key))
    } catch (error) {
      console.warn(`[CacheManager] Failed to delete key "${key}":`, error)
    }
  }

  /**
   * Delete all cache entries matching a pattern.
   */
  deletePattern(pattern: string | RegExp): void {
    try {
      const storage = this.getStorage()
      const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
      const keys = Object.keys(storage)

      keys.forEach((key) => {
        if (regex.test(key)) {
          storage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn(`[CacheManager] Failed to delete pattern:`, error)
    }
  }

  /**
   * Clear all Gradus cache entries.
   */
  clear(): void {
    try {
      const storage = this.getStorage()
      const keys = Object.keys(storage)
      const prefix = `${CacheManager.STORAGE_PREFIX}:${CacheManager.VERSION}`

      keys.forEach((key) => {
        if (key.startsWith(prefix)) {
          storage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('[CacheManager] Failed to clear cache:', error)
    }
  }

  /**
   * Get cache statistics.
   */
  getStats(): { count: number; totalSize: number } {
    try {
      const storage = this.getStorage()
      const keys = Object.keys(storage)
      const prefix = `${CacheManager.STORAGE_PREFIX}:${CacheManager.VERSION}`

      let count = 0
      let totalSize = 0

      keys.forEach((key) => {
        if (key.startsWith(prefix)) {
          count++
          const item = storage.getItem(key)
          if (item) {
            totalSize += item.length
          }
        }
      })

      return { count, totalSize }
    } catch (error) {
      return { count: 0, totalSize: 0 }
    }
  }
}

/**
 * Predefined cache managers for common use cases.
 */
export const localCache = new CacheManager('localStorage')
export const sessionCache = new CacheManager('sessionStorage')

/**
 * Cache key constants for common API endpoints.
 */
export const CACHE_KEYS = {
  // User data
  USER_PROFILE: 'user:profile',
  USER_CLASSROOMS: 'user:classrooms',

  // Classroom data
  CLASSROOM_LIST: 'classroom:list',
  CLASSROOM_DETAIL: (id: string) => `classroom:${id}:detail`,
  CLASSROOM_TASKS: (id: string) => `classroom:${id}:tasks`,
  CLASSROOM_GRADEBOOK: (id: string) => `classroom:${id}:gradebook`,
  CLASSROOM_RESOURCES: (id: string) => `classroom:${id}:resources`,

  // Task data
  TASK_DETAIL: (id: string) => `task:${id}:detail`,
  TASK_RECORDS: (id: string) => `task:${id}:records`,

  // Choices/Constants (static data)
  TASK_STATUS_CHOICES: 'choices:task_status',
  TASK_TYPE_CHOICES: 'choices:task_type',
  TASK_COMPONENT_CHOICES: 'choices:task_component',
}

/**
 * Default TTL values (in seconds) for different cache types.
 */
export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 60 * 60, // 1 hour
  VERY_LONG: 24 * 60 * 60, // 24 hours
}

/**
 * Clear classroom-related caches.
 */
export function clearClassroomCache(classroomId: string): void {
  const pattern = `classroom:${classroomId}`
  localCache.deletePattern(pattern)
  sessionCache.deletePattern(pattern)
}

/**
 * Clear all user-related caches (on logout).
 */
export function clearUserCache(): void {
  localCache.deletePattern('user:')
  sessionCache.deletePattern('user:')
}

/**
 * Clear task-related caches.
 */
export function clearTaskCache(taskId: string, classroomId?: string): void {
  localCache.delete(CACHE_KEYS.TASK_DETAIL(taskId))
  localCache.delete(CACHE_KEYS.TASK_RECORDS(taskId))
  sessionCache.delete(CACHE_KEYS.TASK_DETAIL(taskId))
  sessionCache.delete(CACHE_KEYS.TASK_RECORDS(taskId))

  if (classroomId) {
    clearClassroomCache(classroomId)
  }
}
