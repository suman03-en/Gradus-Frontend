// @refresh reset
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiJson, setToken, getToken } from '../lib/api'
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
    const token = getToken()
    if (!token) {
      setUser(null)
      return
    }

    try {
      const me = await apiJson<User>('/api/v1/accounts/users/me')
      setUser(me)
    } catch {
      setUser(null)
      setToken(null) // Clear invalid token
    }
  }, [])

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await apiJson<{ detail: string; token: string }>('/api/v1/auth-token/login/', {
        method: 'POST',
        body: { username, password },
      })
      if (res.token) {
        setToken(res.token)
      }
      await refresh()
    },
    [refresh],
  )

  const logout = useCallback(async () => {
    try {
      await apiJson<{ detail: string }>('/api/v1/auth-token/logout/', { method: 'POST' })
    } finally {
      setToken(null)
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

