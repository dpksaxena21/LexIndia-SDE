'use client'
import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import Link from 'next/link'

const Ico = ({ d, rect, circle, poly, line }: any) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {d && <path d={d} />}
    {rect && rect.map((r: any, i: number) => <rect key={i} {...r} />)}
    {circle && <circle {...circle} />}
    {poly && <polyline points={poly} />}
    {line && line.map((l: any, i: number) => <line key={i} {...l} />)}
  </svg>
)

const icons = {
  dashboard: <Ico rect={[{x:3,y:3,width:7,height:7,rx:1},{x:14,y:3,width:7,height:7,rx:1},{x:3,y:14,width:7,height:7,rx:1},{x:14,y:14,width:7,height:7,rx:1}]} />,
  search: <Ico circle={{cx:11,cy:11,r:8}} d="m21 21-4.35-4.35" />,
  draft: <Ico d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" poly="14,2 14,8 20,8" line={[{x1:16,y1:13,x2:8,y2:13},{x1:16,y1:17,x2:8,y2:17}]} />,
  chat: <Ico d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  usage: <Ico line={[{x1:18,y1:20,x2:18,y2:10},{x1:12,y1:20,x2:12,y2:4},{x1:6,y1:20,x2:6,y2:14}]} />,
  settings: <Ico circle={{cx:12,cy:12,r:3}} d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />,
  signout: <Ico d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" poly="16,17 21,12 16,7" line={[{x1:21,y1:12,x2:9,y2:12}]} />,
}

export default function UserMenu() {
  const { user, logout, loading } = useAuth()
  const [open, setOpen] = useState(false)

  if (loading) return null

  if (!user) {
    return (
      <Link href="/login" style={{
        padding: '8px 20px', background: '#F4F1EA', color: '#0A0A0B',
        borderRadius: '8px', fontSize: '13px', fontWeight: 600,
        textDecoration: 'none', fontFamily: "'Manrope', system-ui, sans-serif",
      }}>Sign in</Link>
    )
  }

  const initials = user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: icons.dashboard },
    { label: 'Search History', href: '/dashboard?tab=searches', icon: icons.search },
    { label: 'Saved Drafts', href: '/dashboard?tab=drafts', icon: icons.draft },
    { label: 'Chat History', href: '/dashboard?tab=chats', icon: icons.chat },
    { label: 'Usage & Plan', href: '/dashboard?tab=usage', icon: icons.usage },
    { label: 'Settings', href: '/dashboard?tab=settings', icon: icons.settings },
  ]

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        @keyframes menuFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .lex-menu-item:hover { background: #1a1a1e !important; color: #F4F1EA !important; }
        .lex-avatar:hover { border-color: #6B6B6B !important; }
      `}</style>

      <button className="lex-avatar" onClick={() => setOpen(!open)} style={{
        width: '34px', height: '34px', borderRadius: '50%',
        background: '#1a1a1e', border: '1px solid #3a3a3e',
        color: '#F4F1EA', fontSize: '12px', fontWeight: 700,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Manrope', system-ui, sans-serif", transition: 'border-color 0.2s',
        letterSpacing: '0.5px',
      }}>{initials}</button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
          <div style={{
            position: 'absolute', right: 0, top: '42px', width: '232px', zIndex: 99,
            background: '#0f0f11', border: '1px solid #1e1e22', borderRadius: '14px',
            padding: '6px', boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            animation: 'menuFadeIn 0.15s ease',
          }}>
            <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid #1a1a1e', marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F4F1EA' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: '#4a4a4a', marginTop: '2px' }}>{user.email}</div>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  padding: '2px 8px', background: '#1a1a1e', border: '1px solid #2a2a2e',
                  borderRadius: '4px', color: '#6B6B6B', fontSize: '10px', fontWeight: 700,
                  textTransform: 'uppercase' as const, letterSpacing: '0.8px',
                }}>{user.plan}</span>
                {user.plan !== 'pro' && (
                  <Link href="/dashboard?tab=usage" onClick={() => setOpen(false)} style={{
                    fontSize: '11px', color: '#C7A56A', textDecoration: 'none', fontWeight: 600,
                  }}>✦ Upgrade</Link>
                )}
              </div>
            </div>

            {menuItems.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className="lex-menu-item"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px', borderRadius: '8px',
                  color: '#6B6B6B', fontSize: '13px', textDecoration: 'none',
                  transition: 'background 0.12s, color 0.12s',
                }}>
                <span style={{ display: 'flex', opacity: 0.7 }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <div style={{ height: '1px', background: '#1a1a1e', margin: '4px 0' }} />
            <button onClick={() => { logout(); setOpen(false); window.location.href = '/' }}
              className="lex-menu-item"
              style={{
                width: '100%', padding: '8px 10px', background: 'transparent', border: 'none',
                borderRadius: '8px', color: '#ef4444', fontSize: '13px',
                fontFamily: "'Manrope', system-ui, sans-serif", cursor: 'pointer',
                textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: '10px',
              }}>
              <span style={{ display: 'flex' }}>{icons.signout}</span>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}