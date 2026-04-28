'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const { login, googleLogin } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (res.ok) router.push('/')
    else setError(res.error || 'Login failed')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: '#0A0A0B', border: '1px solid #2a2a2e',
    borderRadius: '10px', color: '#F4F1EA', fontSize: '15px',
    fontFamily: "'Manrope', system-ui, sans-serif",
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0B',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Manrope', system-ui, sans-serif", padding: '20px',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes gradientShift {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.06; }
          50% { transform: translateX(-50%) scale(1.15); opacity: 0.1; }
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes particleDrift {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-80px) translateX(20px); opacity: 0; }
        }
        .lex-input:focus { border-color: #3a3a3e !important; }
        .lex-btn-google:hover { background: #f5f5f5 !important; }
        .lex-btn-submit:hover { opacity: 0.9; }
      `}</style>

      {/* Animated background glow */}
      <div style={{
        position: 'fixed', top: '-10%', left: '50%',
        width: '700px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(199,165,106,1) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'gradientShift 6s ease-in-out infinite',
      }} />

      {/* Floating particles */}
      {mounted && [
        { left: '15%', delay: '0s', duration: '8s', size: 2 },
        { left: '35%', delay: '2s', duration: '10s', size: 1.5 },
        { left: '55%', delay: '4s', duration: '7s', size: 2.5 },
        { left: '72%', delay: '1s', duration: '9s', size: 1.5 },
        { left: '85%', delay: '3s', duration: '11s', size: 2 },
      ].map((p, i) => (
        <div key={i} style={{
          position: 'fixed', bottom: '10%', left: p.left,
          width: `${p.size}px`, height: `${p.size}px`,
          borderRadius: '50%', background: 'rgba(199,165,106,0.4)',
          pointerEvents: 'none',
          animation: `particleDrift ${p.duration} ${p.delay} ease-in-out infinite`,
        }} />
      ))}

      <div style={{
        width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1,
        animation: mounted ? 'floatIn 0.6s ease forwards' : 'none',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeIn 0.8s ease' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
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
              <span style={{ fontSize: '22px', fontWeight: 700, color: '#F4F1EA', letterSpacing: '-0.5px' }}>LexIndia</span>
            </div>
          </Link>
          <p style={{ color: '#6B6B6B', fontSize: '14px' }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(17,17,19,0.8)', backdropFilter: 'blur(20px)',
          border: '1px solid #1e1e22', borderRadius: '16px', padding: '32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          {/* Google button */}
          <button onClick={googleLogin} className="lex-btn-google" style={{
            width: '100%', padding: '12px',
            background: '#fff', border: '1px solid #e0e0e0',
            borderRadius: '10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontSize: '15px', fontWeight: 600, color: '#1a1a1a',
            fontFamily: "'Manrope', system-ui, sans-serif",
            marginBottom: '20px', transition: 'background 0.2s',
          }}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#1e1e22' }} />
            <span style={{ color: '#4a4a4a', fontSize: '12px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#1e1e22' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#8B8B8B', fontWeight: 500 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" style={inputStyle} className="lex-input"
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#8B8B8B', fontWeight: 500 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••" style={inputStyle} className="lex-input"
              />
            </div>

            {error && (
              <div style={{
                marginBottom: '16px', padding: '10px 14px',
                background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: '8px', color: '#ef4444', fontSize: '13px',
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} className="lex-btn-submit" style={{
              width: '100%', padding: '13px',
              background: loading ? '#2a2a2e' : '#F4F1EA',
              color: loading ? '#6B6B6B' : '#0A0A0B',
              border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: 600,
              fontFamily: "'Manrope', system-ui, sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
            }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#6B6B6B', fontSize: '14px' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: '#F4F1EA', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid #3a3a3e', paddingBottom: '1px' }}>Create one</Link>
        </p>
      </div>
    </div>
  )
}