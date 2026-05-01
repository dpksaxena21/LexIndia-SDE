'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const API = 'https://lexindia-backend-production.up.railway.app'
const GOOGLE_CLIENT_ID = '11406556087-3e36okufug2grcsdh2v80dhgnlq2dued.apps.googleusercontent.com'

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
  googleLogin: () => void
  logout: () => void
}

const AuthContext = createContext<AuthCtx>({
  user: null, token: null, loading: true,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  googleLogin: () => {},
  logout: () => {},
})

// Wake backend on app load to avoid cold start delays
function wakeBackend() {
  fetch(`${API}/ping`).catch(() => {})
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Wake backend immediately on load
  useEffect(() => {
    wakeBackend()
  }, [])

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    document.head.appendChild(script)
    return () => {
      try { document.head.removeChild(script) } catch {}
    }
  }, [])

  // Restore session
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

  const saveSession = (data: { token: string; user: User }) => {
    localStorage.setItem('lex_token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

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
      saveSession(await res.json())
      return { ok: true }
    } catch {
      return { ok: false, error: 'Server is starting up, please try again in 10 seconds.' }
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
      saveSession(await res.json())
      return { ok: true }
    } catch {
      return { ok: false, error: 'Server is starting up, please try again in 10 seconds.' }
    }
  }

  const googleLogin = () => {
    // @ts-ignore
    if (!window.google) {
      alert('Google login is loading, please wait a moment and try again.')
      return
    }
    // @ts-ignore
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: async (response: { access_token: string; error?: string }) => {
        if (response.error) {
          // User cancelled or popup blocked — silently ignore
          return
        }
        if (!response.access_token) return
        try {
          const res = await fetch(`${API}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: response.access_token }),
          })
          if (!res.ok) {
            const err = await res.json()
            alert(err.detail || 'Google login failed. Please try email login instead.')
            return
          }
          saveSession(await res.json())
          window.location.href = '/'
        } catch {
          alert('Could not connect to server. Please check your connection and try again.')
        }
      },
    })
    client.requestAccessToken({ prompt: 'select_account' })
  }

  const logout = () => {
    localStorage.removeItem('lex_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export { GOOGLE_CLIENT_ID }