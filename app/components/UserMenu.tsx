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
        transition: 'opacity 0.2s',
      }}>Sign in</Link>
    )
  }

  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

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
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 98,
            }}
          />
          {/* Dropdown */}
          <div style={{
            position: 'absolute', right: 0, top: '44px',
            width: '220px', zIndex: 99,
            background: '#111113',
            border: '1px solid #1e1e22',
            borderRadius: '12px',
            padding: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            {/* User info */}
            <div style={{
              padding: '10px 12px',
              borderBottom: '1px solid #1e1e22',
              marginBottom: '4px',
            }}>
              <div style={{ color: '#F4F1EA', fontSize: '14px', fontWeight: 600 }}>
                {user.name}
              </div>
              <div style={{ color: '#6B6B6B', fontSize: '12px', marginTop: '2px' }}>
                {user.email}
              </div>
              <div style={{
                display: 'inline-block', marginTop: '6px',
                padding: '2px 8px',
                background: 'rgba(199,165,106,0.1)',
                border: '1px solid rgba(199,165,106,0.2)',
                borderRadius: '4px',
                color: '#C7A56A',
                fontSize: '11px', fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {user.plan}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => { logout(); setOpen(false) }}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#8B8B8B',
                fontSize: '13px',
                fontFamily: "'Manrope', system-ui, sans-serif",
                cursor: 'pointer',
                textAlign: 'left',
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
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
