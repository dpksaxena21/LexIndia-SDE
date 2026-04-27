'use client'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const res = await register(email, name, password)
    setLoading(false)
    if (res.ok) router.push('/')
    else setError(res.error || 'Registration failed')
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: '#0A0A0B', border: '1px solid #2a2a2e',
    borderRadius: '10px', color: '#F4F1EA', fontSize: '15px',
    fontFamily: "'Manrope', system-ui, sans-serif",
    outline: 'none', transition: 'border-color 0.2s',
  }

  const labelStyle = {
    display: 'block' as const, marginBottom: '8px',
    fontSize: '13px', color: '#8B8B8B', fontWeight: 500,
    letterSpacing: '0.3px',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Manrope', system-ui, sans-serif",
      padding: '20px',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(199,165,106,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: '420px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              marginBottom: '12px',
            }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="1"  width="5" height="5" rx="1" fill="#ffffff" opacity="0.25"/>
                <rect x="4" y="7"  width="5" height="5" rx="1" fill="#ffffff" opacity="0.45"/>
                <rect x="4" y="13" width="5" height="5" rx="1" fill="#ffffff" opacity="0.65"/>
                <rect x="4" y="19" width="5" height="5" rx="1" fill="#ffffff" opacity="0.85"/>
                <rect x="4" y="25" width="5" height="5" rx="1" fill="#ffffff"/>
                <rect x="12" y="7"  width="5" height="5" rx="1" fill="#ffffff" opacity="0.25"/>
                <rect x="12" y="13" width="5" height="5" rx="1" fill="#ffffff" opacity="0.5"/>
                <rect x="12" y="19" width="5" height="5" rx="1" fill="#ffffff" opacity="0.8"/>
                <rect x="12" y="25" width="5" height="5" rx="1" fill="#ffffff"/>
                <rect x="20" y="25" width="5" height="5" rx="1" fill="#ffffff" opacity="0.6"/>
                <rect x="27" y="25" width="5" height="5" rx="1" fill="#ffffff" opacity="0.3"/>
              </svg>
              <span style={{
                fontSize: '22px', fontWeight: 700, color: '#F4F1EA',
                letterSpacing: '-0.5px',
              }}>LexIndia</span>
            </div>
          </Link>
          <p style={{
            color: '#6B6B6B', fontSize: '14px', letterSpacing: '0.5px',
          }}>Create your account</p>
        </div>

        {/* Form card */}
        <div style={{
          background: '#111113',
          border: '1px solid #1e1e22',
          borderRadius: '16px',
          padding: '32px',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Adv. Sharma"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3a3a3e'}
                onBlur={e => e.target.style.borderColor = '#2a2a2e'}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3a3a3e'}
                onBlur={e => e.target.style.borderColor = '#2a2a2e'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Min 6 characters"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3a3a3e'}
                onBlur={e => e.target.style.borderColor = '#2a2a2e'}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: '16px', padding: '10px 14px',
                background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: '8px', color: '#ef4444', fontSize: '13px',
              }}>{error}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#2a2a2e' : '#F4F1EA',
                color: loading ? '#6B6B6B' : '#0A0A0B',
                border: 'none', borderRadius: '10px',
                fontSize: '15px', fontWeight: 600,
                fontFamily: "'Manrope', system-ui, sans-serif",
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p style={{
          textAlign: 'center', marginTop: '24px',
          color: '#6B6B6B', fontSize: '14px',
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{
            color: '#F4F1EA', textDecoration: 'none',
            fontWeight: 500, borderBottom: '1px solid #3a3a3e',
            paddingBottom: '1px',
          }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
