'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const { login, googleLogin } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (res.ok) router.push('/')
    else setError(res.error || 'Login failed')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#060608',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Manrope', system-ui, sans-serif", padding: '20px',
      overflow: 'hidden', position: 'relative',
    }}>
      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          33% { transform: translate(-45%, -55%) scale(1.08); }
          66% { transform: translate(-55%, -45%) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          33% { transform: translate(-55%, -45%) scale(1.05); }
          66% { transform: translate(-45%, -55%) scale(1.1); }
        }
        @keyframes gridFade {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes scanLine {
          from { transform: translateY(-100%); }
          to { transform: translateY(100vh); }
        }
        .lex-input { transition: border-color 0.2s, box-shadow 0.2s; }
        .lex-input:focus { border-color: #3a3a3e !important; box-shadow: 0 0 0 3px rgba(199,165,106,0.06) !important; outline: none; }
        .lex-google:hover { background: #f8f8f8 !important; }
        .lex-submit:hover:not(:disabled) { background: #e8e5dd !important; }
      `}</style>

      {/* Grid background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        animation: 'gridFade 2s ease forwards',
        opacity: 0,
      }} />

      {/* Scan line */}
      <div style={{
        position: 'fixed', left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(199,165,106,0.15), transparent)',
        zIndex: 0, animation: 'scanLine 8s linear infinite',
        animationDelay: '2s',
      }} />

      {/* Orb 1 — gold */}
      <div style={{
        position: 'fixed', top: '30%', left: '40%',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(199,165,106,0.08) 0%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        animation: 'orbFloat 12s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Orb 2 — blue-purple accent */}
      <div style={{
        position: 'fixed', top: '65%', left: '65%',
        width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        animation: 'orbFloat2 15s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Corner accents */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '200px', height: '200px',
        background: 'radial-gradient(circle at top left, rgba(199,165,106,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: 0, right: 0, width: '200px', height: '200px',
        background: 'radial-gradient(circle at bottom right, rgba(99,102,241,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0 }} />

      {/* Content */}
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{
          textAlign: 'center', marginBottom: '40px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="1"  width="5" height="5" rx="1" fill="#fff" opacity="0.25"/>
                <rect x="4" y="7"  width="5" height="5" rx="1" fill="#fff" opacity="0.45"/>
                <rect x="4" y="13" width="5" height="5" rx="1" fill="#fff" opacity="0.65"/>
                <rect x="4" y="19" width="5" height="5" rx="1" fill="#fff" opacity="0.85"/>
                <rect x="4" y="25" width="5" height="5" rx="1" fill="#fff"/>
                <rect x="12" y="7"  width="5" height="5" rx="1" fill="#fff" opacity="0.25"/>
                <rect x="12" y="13" width="5" height="5" rx="1" fill="#fff" opacity="0.5"/>
                <rect x="12" y="19" width="5" height="5" rx="1" fill="#fff" opacity="0.8"/>
                <rect x="12" y="25" width="5" height="5" rx="1" fill="#fff"/>
                <rect x="20" y="25" width="5" height="5" rx="1" fill="#fff" opacity="0.6"/>
                <rect x="27" y="25" width="5" height="5" rx="1" fill="#fff" opacity="0.3"/>
              </svg>
              <span style={{ fontSize: '22px', fontWeight: 700, color: '#F4F1EA', letterSpacing: '-0.5px' }}>LexIndia</span>
            </div>
          </Link>
          <p style={{ color: '#4a4a4a', fontSize: '13px', letterSpacing: '0.5px', animation: 'shimmer 4s ease-in-out infinite' }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(10,10,12,0.85)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '32px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
        }}>
          {/* Google */}
          <button onClick={googleLogin} className="lex-google" style={{
            width: '100%', padding: '11px',
            background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontSize: '14px', fontWeight: 600, color: '#1a1a1a',
            fontFamily: "'Manrope', system-ui, sans-serif",
            marginBottom: '20px', transition: 'background 0.15s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
            <span style={{ color: '#333', fontSize: '11px', letterSpacing: '0.5px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '7px', fontSize: '12px', color: '#555', fontWeight: 500, letterSpacing: '0.3px' }}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" className="lex-input"
                style={{
                  width: '100%', padding: '11px 14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '10px', color: '#F4F1EA', fontSize: '14px',
                  fontFamily: "'Manrope', system-ui, sans-serif", boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '7px', fontSize: '12px', color: '#555', fontWeight: 500, letterSpacing: '0.3px' }}>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••" className="lex-input"
                style={{
                  width: '100%', padding: '11px 14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '10px', color: '#F4F1EA', fontSize: '14px',
                  fontFamily: "'Manrope', system-ui, sans-serif", boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{
                marginBottom: '16px', padding: '10px 14px',
                background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)',
                borderRadius: '8px', color: '#ef4444', fontSize: '13px',
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} className="lex-submit" style={{
              width: '100%', padding: '12px',
              background: loading ? '#1a1a1e' : '#F4F1EA',
              color: loading ? '#444' : '#0A0A0B',
              border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: 700,
              fontFamily: "'Manrope', system-ui, sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.3px', transition: 'background 0.15s',
            }}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center', marginTop: '24px', color: '#333', fontSize: '13px',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.8s ease 0.3s',
        }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: '#8B8B8B', textDecoration: 'none', fontWeight: 500 }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}