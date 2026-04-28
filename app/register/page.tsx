'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const { register, googleLogin } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [litBlocks, setLitBlocks] = useState<number[]>([])

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
    const blocks = [0,1,2,3,4,5,6,7,8,9,10]
    blocks.forEach((_, i) => {
      setTimeout(() => setLitBlocks(prev => [...prev, i]), 100 + i * 80)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const res = await register(email, name, password)
    setLoading(false)
    if (res.ok) router.push('/')
    else setError(res.error || 'Registration failed')
  }

  const logoBlocks = [
    { x: 4,  y: 1,  baseOp: 0.25 }, { x: 4,  y: 7,  baseOp: 0.45 },
    { x: 4,  y: 13, baseOp: 0.65 }, { x: 4,  y: 19, baseOp: 0.85 },
    { x: 4,  y: 25, baseOp: 1    }, { x: 12, y: 7,  baseOp: 0.25 },
    { x: 12, y: 13, baseOp: 0.5  }, { x: 12, y: 19, baseOp: 0.8  },
    { x: 12, y: 25, baseOp: 1    }, { x: 20, y: 25, baseOp: 0.6  },
    { x: 27, y: 25, baseOp: 0.3  },
  ]

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '10px', color: '#F4F1EA', fontSize: '14px',
    fontFamily: "'Manrope', system-ui, sans-serif", boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
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
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          33% { transform: translate(-45%,-55%) scale(1.08); }
          66% { transform: translate(-55%,-45%) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          33% { transform: translate(-55%,-45%) scale(1.05); }
          66% { transform: translate(-45%,-55%) scale(1.1); }
        }
        @keyframes scanLine {
          from { transform: translateY(-100%); }
          to { transform: translateY(100vh); }
        }
        .lex-input:focus {
          border-color: rgba(199,165,106,0.4) !important;
          box-shadow: 0 0 0 3px rgba(199,165,106,0.06), inset 0 0 0 1px rgba(199,165,106,0.1) !important;
        }
        .lex-google:hover { background: #f8f8f8 !important; }
        .lex-submit:hover:not(:disabled) { background: #e8e5dd !important; }
        .eye-btn { background: none; border: none; cursor: pointer; padding: 0; color: #555; transition: color 0.2s; }
        .eye-btn:hover { color: #8B8B8B; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      <div style={{ position: 'fixed', left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(199,165,106,0.12), transparent)', zIndex: 0, animation: 'scanLine 10s linear infinite', animationDelay: '1s' }} />
      <div style={{ position: 'fixed', top: '30%', left: '60%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(199,165,106,0.07) 0%, transparent 70%)', transform: 'translate(-50%,-50%)', animation: 'orbFloat 14s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '70%', left: '35%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', transform: 'translate(-50%,-50%)', animation: 'orbFloat2 18s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: '32px', opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                {logoBlocks.map((b, i) => (
                  <rect key={i} x={b.x} y={b.y} width="5" height="5" rx="1"
                    fill="#ffffff" opacity={litBlocks.includes(i) ? b.baseOp : 0}
                    style={{ transition: 'opacity 0.3s ease' }} />
                ))}
              </svg>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#F4F1EA', letterSpacing: '-0.5px', opacity: litBlocks.length > 8 ? 1 : 0, transition: 'opacity 0.4s ease' }}>LexIndia</span>
            </div>
          </Link>
          <p style={{ color: '#2a2a2a', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>Create your account</p>
        </div>

        <div style={{
          background: 'rgba(10,10,12,0.9)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '28px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
        }}>
          <button onClick={googleLogin} className="lex-google" style={{
            width: '100%', padding: '11px', background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            fontSize: '14px', fontWeight: 600, color: '#1a1a1a', fontFamily: "'Manrope', system-ui, sans-serif",
            marginBottom: '18px', transition: 'background 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.04)' }} />
            <span style={{ color: '#2a2a2a', fontSize: '11px', letterSpacing: '0.5px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.04)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: '#444', fontWeight: 600, letterSpacing: '0.8px' }}>FULL NAME</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                required placeholder="Adv. Sharma" className="lex-input" style={inputBase} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: '#444', fontWeight: 600, letterSpacing: '0.8px' }}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" className="lex-input" style={inputBase} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: '#444', fontWeight: 600, letterSpacing: '0.8px' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  required placeholder="Min 6 characters" className="lex-input"
                  style={{ ...inputBase, paddingRight: '42px' }} />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ marginBottom: '14px', padding: '10px 14px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '8px', color: '#ef4444', fontSize: '13px' }}>{error}</div>
            )}

            <button type="submit" disabled={loading} className="lex-submit" style={{
              width: '100%', padding: '12px',
              background: loading ? '#1a1a1e' : '#F4F1EA',
              color: loading ? '#444' : '#0A0A0B',
              border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
              fontFamily: "'Manrope', system-ui, sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.3px', transition: 'background 0.15s',
            }}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#2a2a2a', fontSize: '13px', opacity: mounted ? 1 : 0, transition: 'opacity 0.8s ease 0.3s' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#6B6B6B', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}