'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const API = 'https://lexindia-backend-production.up.railway.app'

interface User {
  id: string
  email: string
  name: string
  plan: string
}

interface AuthCtx {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (email: string, name: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthCtx>({
  user: null, token: null, loading: true,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('lex_token')
    if (saved) {
      setToken(saved)
      fetch(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${saved}` },
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) setUser(data)
          else { localStorage.removeItem('lex_token'); setToken(null) }
        })
        .catch(() => { localStorage.removeItem('lex_token'); setToken(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const err = await res.json()
        return { ok: false, error: err.detail || 'Login failed' }
      }
      const data = await res.json()
      localStorage.setItem('lex_token', data.token)
      setToken(data.token)
      setUser(data.user)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error' }
    }
  }

  const register = async (email: string, name: string, password: string) => {
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      })
      if (!res.ok) {
        const err = await res.json()
        return { ok: false, error: err.detail || 'Registration failed' }
      }
      const data = await res.json()
      localStorage.setItem('lex_token', data.token)
      setToken(data.token)
      setUser(data.user)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error' }
    }
  }

  const logout = () => {
    localStorage.removeItem('lex_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
