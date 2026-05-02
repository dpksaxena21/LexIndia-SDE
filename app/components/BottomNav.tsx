'use client'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const path = usePathname()

  const tabs = [
    {
      label: 'Home',
      path: '/',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      label: 'Search',
      path: '/research',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round">
          <circle cx="10" cy="10" r="7"/>
          <line x1="15.5" y1="15.5" x2="21" y2="21"/>
        </svg>
      )
    },
    {
      label: 'Chat',
      path: '/assistant',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      )
    },
    {
      label: 'Draft',
      path: '/drafts',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="8" y1="13" x2="16" y2="13"/>
          <line x1="8" y1="17" x2="12" y2="17"/>
        </svg>
      )
    },
    {
      label: 'More',
      path: '/dashboard',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round">
          <circle cx="12" cy="5" r="1" fill="currentColor"/>
          <circle cx="12" cy="12" r="1" fill="currentColor"/>
          <circle cx="12" cy="19" r="1" fill="currentColor"/>
        </svg>
      )
    },
  ]

  const isActive = (tabPath: string) => {
    if (tabPath === '/') return path === '/'
    return path.startsWith(tabPath)
  }

  return (
    <>
      <style>{`
        .bottom-nav-btn { transition: color 0.15s, transform 0.15s; }
        .bottom-nav-btn:active { transform: scale(0.9); }
      `}</style>
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(6,6,8,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
      }}>
        {tabs.map(tab => {
          const active = isActive(tab.path)
          return (
            <button
              key={tab.path}
              className="bottom-nav-btn"
              onClick={() => window.location.href = tab.path}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '10px 0 6px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: active ? '#ffffff' : 'rgba(255,255,255,0.3)',
                fontFamily: 'inherit',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {tab.icon(active)}
              <span style={{
                fontSize: 10,
                fontWeight: active ? 700 : 400,
                letterSpacing: '0.3px',
              }}>
                {tab.label}
              </span>
              {active && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% - 2px)',
                  width: 20,
                  height: 2,
                  borderRadius: 1,
                  background: '#ffffff',
                }}/>
              )}
            </button>
          )
        })}
      </nav>
      {/* Spacer so content doesn't hide behind nav */}
      <div style={{ height: 72 }}/>
    </>
  )
}