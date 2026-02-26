import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiJson } from '../lib/api'
import type { User } from '../lib/types'

type AuthState = {
  user: User | null
  isLoading: boolean
  refresh: () => Promise<void>
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const me = await apiJson<User>('/api/v1/accounts/users/me')
      setUser(me)
    } catch {
      setUser(null)
    }
  }, [])

  const login = useCallback(
    async (username: string, password: string) => {
      await apiJson<{ details: string }>('/api/v1/accounts/login/', {
        method: 'POST',
        body: { username, password },
      })
      await refresh()
    },
    [refresh],
  )

  const logout = useCallback(async () => {
    try {
      await apiJson<{ details: string }>('/api/v1/accounts/logout/', { method: 'POST' })
    } finally {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      await refresh()
      setIsLoading(false)
    })()
  }, [refresh])

  const value = useMemo<AuthState>(() => ({ user, isLoading, refresh, login, logout }), [user, isLoading, refresh, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

