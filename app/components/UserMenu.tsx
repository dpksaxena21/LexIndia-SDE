'use client'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import Link from 'next/link'

export default function UserMenu() {
  const { user, logout, loading } = useAuth()
  const [open, setOpen] = useState(false)

  if (loading) return null

  if (!user) {
    return (
      <Link href="/login" style={{
        padding: '8px 20px',
        background: '#F4F1EA',
        color: '#0A0A0B',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        textDecoration: 'none',
        fontFamily: "'Manrope', system-ui, sans-serif",
      }}>Sign in</Link>
    )
  }

  const initials = user.name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '⬜' },
    { label: 'Search History', href: '/dashboard?tab=searches', icon: '🔍' },
    { label: 'Saved Drafts', href: '/dashboard?tab=drafts', icon: '📄' },
    { label: 'Chat History', href: '/dashboard?tab=chats', icon: '💬' },
    { label: 'Usage & Plan', href: '/dashboard?tab=usage', icon: '📊' },
    { label: 'Settings', href: '/dashboard?tab=settings', icon: '⚙️' },
  ]

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '36px', height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2a2a2e, #1e1e22)',
          border: '1px solid #3a3a3e',
          color: '#F4F1EA',
          fontSize: '13px', fontWeight: 600,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Manrope', system-ui, sans-serif",
        }}
      >
        {initials}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
          <div style={{
            position: 'absolute', right: 0, top: '44px',
            width: '240px', zIndex: 99,
            background: '#111113',
            border: '1px solid #1e1e22',
            borderRadius: '14px',
            padding: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            {/* User info */}
            <div style={{
              padding: '10px 12px 12px',
              borderBottom: '1px solid #1e1e22',
              marginBottom: '6px',
            }}>
              <div style={{ color: '#F4F1EA', fontSize: '14px', fontWeight: 600 }}>{user.name}</div>
              <div style={{ color: '#6B6B6B', fontSize: '12px', marginTop: '2px' }}>{user.email}</div>
              <div style={{
                display: 'inline-block', marginTop: '6px',
                padding: '2px 8px',
                background: user.plan === 'pro' ? 'rgba(199,165,106,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${user.plan === 'pro' ? 'rgba(199,165,106,0.3)' : '#2a2a2e'}`,
                borderRadius: '4px',
                color: user.plan === 'pro' ? '#C7A56A' : '#6B6B6B',
                fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.8px',
              }}>
                {user.plan === 'pro' ? '✦ Pro' : 'Free'}
              </div>
              {user.plan !== 'pro' && (
                <Link href="/dashboard?tab=usage" onClick={() => setOpen(false)} style={{
                  display: 'block', marginTop: '8px',
                  padding: '6px 10px',
                  background: 'linear-gradient(135deg, rgba(199,165,106,0.15), rgba(199,165,106,0.05))',
                  border: '1px solid rgba(199,165,106,0.2)',
                  borderRadius: '6px',
                  color: '#C7A56A',
                  fontSize: '12px', fontWeight: 600,
                  textDecoration: 'none',
                  textAlign: 'center' as const,
                }}>
                  ✦ Upgrade to Pro
                </Link>
              )}
            </div>

            {/* Menu items */}
            {menuItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  color: '#8B8B8B',
                  fontSize: '13px',
                  textDecoration: 'none',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#1a1a1e'
                  e.currentTarget.style.color = '#F4F1EA'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#8B8B8B'
                }}
              >
                <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' as const }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {/* Divider + Sign out */}
            <div style={{ height: '1px', background: '#1e1e22', margin: '6px 0' }} />
            <button
              onClick={() => { logout(); setOpen(false); window.location.href = '/' }}
              style={{
                width: '100%', padding: '9px 12px',
                background: 'transparent', border: 'none',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '13px',
                fontFamily: "'Manrope', system-ui, sans-serif",
                cursor: 'pointer', textAlign: 'left' as const,
                display: 'flex', alignItems: 'center', gap: '10px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' as const }}>→</span>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
