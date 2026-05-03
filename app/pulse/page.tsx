'use client'
import { useState, useEffect, useCallback } from 'react'

const API = 'https://lexindia-backend-production.up.railway.app'

function LogoMark({ size = 24, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="1" width="5" height="5" rx="1" fill={color} opacity="0.25"/>
      <rect x="4" y="7" width="5" height="5" rx="1" fill={color} opacity="0.45"/>
      <rect x="4" y="13" width="5" height="5" rx="1" fill={color} opacity="0.65"/>
      <rect x="4" y="19" width="5" height="5" rx="1" fill={color} opacity="0.85"/>
      <rect x="4" y="25" width="5" height="5" rx="1" fill={color}/>
      <rect x="12" y="7" width="5" height="5" rx="1" fill={color} opacity="0.25"/>
      <rect x="12" y="13" width="5" height="5" rx="1" fill={color} opacity="0.5"/>
      <rect x="12" y="19" width="5" height="5" rx="1" fill={color} opacity="0.8"/>
      <rect x="12" y="25" width="5" height="5" rx="1" fill={color}/>
      <rect x="20" y="25" width="5" height="5" rx="1" fill={color} opacity="0.6"/>
      <rect x="27" y="25" width="5" height="5" rx="1" fill={color} opacity="0.3"/>
    </svg>
  )
}

type Article = {
  title: string
  url: string
  source: string
  summary: string
  date: string
}

const CATEGORIES = [
  { id: 'all', label: 'All News', color: '#C7A56A' },
  { id: 'supreme', label: 'Supreme Court', color: '#6366f1' },
  { id: 'highcourt', label: 'High Courts', color: '#10b981' },
  { id: 'legislation', label: 'Legislation', color: '#f59e0b' },
  { id: 'bns', label: 'BNS / BNSS', color: '#ec4899' },
]

function SkeletonCard() {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px', animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{ height: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 10, width: '30%' }}/>
      <div style={{ height: 18, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 8 }}/>
      <div style={{ height: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 6 }}/>
      <div style={{ height: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 4, width: '80%' }}/>
    </div>
  )
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60))
    if (diff < 1) return 'Just now'
    if (diff < 24) return `${diff}h ago`
    if (diff < 48) return 'Yesterday'
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch { return '' }
}

function getSourceColor(source: string) {
  if (source.includes('livelaw')) return '#ef4444'
  if (source.includes('barandbench')) return '#8b5cf6'
  if (source.includes('thehindu')) return '#3b82f6'
  if (source.includes('scobserver')) return '#f59e0b'
  return '#6b7280'
}

export default function LexPulse() {
  const [articles, setArticles] = useState<Article[]>([])
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [width, setWidth] = useState(1200)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    setWidth(window.innerWidth)
    const h = () => setWidth(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const isMobile = width < 768

  const fetchNews = useCallback(async (cat: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch(`${API}/api/pulse?category=${cat}`)
      const data = await res.json()
      setArticles(data.articles || [])
      setLastUpdated(new Date())
    } catch {
      setArticles([])
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchNews(category) }, [category, fetchNews])

  const bg = '#080809'
  const surface = 'rgba(255,255,255,0.03)'
  const border = 'rgba(255,255,255,0.08)'
  const tp = '#ffffff'
  const tm = 'rgba(255,255,255,0.6)'
  const td = 'rgba(255,255,255,0.3)'
  const gold = '#C7A56A'
  const activeCat = CATEGORIES.find(c => c.id === category)

  return (
    <main style={{ minHeight: '100vh', background: bg, color: tp, fontFamily: 'system-ui,sans-serif', paddingBottom: isMobile ? 80 : 40 }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .article-card:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.12) !important; transform: translateY(-2px); }
        .cat-btn:hover { background: rgba(255,255,255,0.06) !important; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${border}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,8,9,0.95)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogoMark size={20} color={tp}/>
            <span style={{ fontSize: 14, fontWeight: 700, color: tp }}>LexIndia</span>
          </button>
          <span style={{ color: td }}>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round"><polyline points="2 12 6 12 8 5 11 19 14 9 16 15 18 12 22 12"/></svg>
            <span style={{ fontSize: 14, fontWeight: 600, color: gold }}>LexPulse</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastUpdated && <span style={{ fontSize: 11, color: td }}>Updated {formatDate(lastUpdated.toISOString())}</span>}
          <button onClick={() => fetchNews(category, true)} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: surface, border: `1px solid ${border}`, borderRadius: 8, color: tm, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          {!isMobile && (
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: td }}>
              <a href="/research" style={{ color: 'inherit', textDecoration: 'none' }}>Research</a>
              <a href="/assistant" style={{ color: 'inherit', textDecoration: 'none' }}>Chat</a>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: isMobile ? '32px 16px 16px' : '48px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950', boxShadow: '0 0 8px #3fb950', animation: 'pulse 2s ease-in-out infinite' }}/>
          <span style={{ fontSize: 11, color: '#3fb950', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Live</span>
        </div>
        <h1 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, color: tp, letterSpacing: -1, marginBottom: 8 }}>Legal News India</h1>
        <p style={{ fontSize: 14, color: tm, marginBottom: 0 }}>Latest from Supreme Court, High Courts, and Indian legal landscape</p>
      </div>

      {/* CATEGORY TABS */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px 24px' }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} className="cat-btn" onClick={() => setCategory(cat.id)}
              style={{ padding: '7px 16px', background: category === cat.id ? `rgba(${cat.color === '#C7A56A' ? '199,165,106' : cat.color === '#6366f1' ? '99,102,241' : cat.color === '#10b981' ? '16,185,129' : cat.color === '#f59e0b' ? '245,158,11' : '236,72,153'},0.15)` : surface, border: `1px solid ${category === cat.id ? cat.color + '44' : border}`, borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: category === cat.id ? 700 : 400, color: category === cat.id ? cat.color : tm, whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0 }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ARTICLES */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i}/>)}
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: td }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={td} strokeWidth="1" strokeLinecap="round" style={{ marginBottom: 16 }}><polyline points="2 12 6 12 8 5 11 19 14 9 16 15 18 12 22 12"/></svg>
            <div style={{ fontSize: 14 }}>No news found. Try refreshing.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 12 }}>
            {articles.map((article, i) => (
              <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
                className="article-card"
                style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: '20px', textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s', display: 'block', animation: `fadeIn 0.4s ease ${i * 0.04}s both` }}>
                {/* Source + date */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: getSourceColor(article.source), flexShrink: 0 }}/>
                    <span style={{ fontSize: 11, color: getSourceColor(article.source), fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{article.source.split('.')[0]}</span>
                  </div>
                  {article.date && <span style={{ fontSize: 11, color: td }}>{formatDate(article.date)}</span>}
                </div>

                {/* Title */}
                <div style={{ fontSize: 14, fontWeight: 600, color: tp, lineHeight: 1.5, marginBottom: 10 }}>{article.title}</div>

                {/* Summary */}
                {article.summary && (
                  <div style={{ fontSize: 12, color: tm, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{article.summary}</div>
                )}

                {/* Read more */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, fontSize: 11, color: activeCat?.color || gold }}>
                  Read full article
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Count */}
        {!loading && articles.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: td }}>
            {articles.length} articles · {CATEGORIES.find(c => c.id === category)?.label}
          </div>
        )}
      </div>
    </main>
  )
}