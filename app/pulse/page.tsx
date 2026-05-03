'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../auth/AuthContext'

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
  title: string; url: string; source: string; summary: string; date: string
}

const CATEGORIES = [
  { id: 'today', label: 'Today', color: '#3fb950' },
  { id: 'all', label: 'All News', color: '#C7A56A' },
  { id: 'supreme', label: 'Supreme Court', color: '#6366f1' },
  { id: 'highcourt', label: 'High Courts', color: '#10b981' },
  { id: 'legislation', label: 'Legislation', color: '#f59e0b' },
  { id: 'bns', label: 'BNS / BNSS', color: '#ec4899' },
]

const SOURCE_COLORS: Record<string, string> = {
  'livelaw': '#ef4444', 'barandbench': '#8b5cf6', 'thehindu': '#3b82f6',
  'scobserver': '#f59e0b', 'indianexpress': '#0ea5e9', 'prsindia': '#10b981',
  'ndtv': '#ef4444', 'hindustantimes': '#f97316', 'sci': '#6366f1',
}

function getSourceColor(source: string) {
  for (const [key, color] of Object.entries(SOURCE_COLORS)) {
    if (source.includes(key)) return color
  }
  return '#6b7280'
}

function getSourceName(source: string) {
  if (source.includes('livelaw')) return 'Live Law'
  if (source.includes('barandbench')) return 'Bar & Bench'
  if (source.includes('thehindu')) return 'The Hindu'
  if (source.includes('scobserver')) return 'SC Observer'
  if (source.includes('indianexpress')) return 'Indian Express'
  if (source.includes('prsindia')) return 'PRS India'
  if (source.includes('ndtv')) return 'NDTV'
  if (source.includes('hindustantimes')) return 'HT'
  if (source.includes('sci.gov')) return 'Supreme Court'
  return source.split('.')[0].toUpperCase()
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

function estimateReadTime(text: string) {
  const words = text.split(' ').length
  return Math.max(1, Math.ceil(words / 200))
}

function BackButton() {
  if (typeof window === 'undefined') return null
  if (window.history.length <= 1) return null
  return (
    <button
      onClick={() => window.history.back()}
      style={{
        position: 'fixed', top: 14, left: 14, zIndex: 999,
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'rgba(8,8,9,0.85)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8, padding: '6px 12px',
        cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
        fontSize: 12, fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = '#ffffff'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Back
    </button>
  )
}

function SkeletonCard({ featured = false }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: featured ? '28px' : '20px', animation: 'shimmer 1.5s ease-in-out infinite' }}>
      <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 12, width: '20%' }}/>
      <div style={{ height: featured ? 28 : 18, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginBottom: 8 }}/>
      {featured && <div style={{ height: 18, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginBottom: 8, width: '80%' }}/>}
      <div style={{ height: 13, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 6 }}/>
      <div style={{ height: 13, background: 'rgba(255,255,255,0.05)', borderRadius: 4, width: '75%' }}/>
    </div>
  )
}

export default function LexPulse() {
  const { token } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [category, setCategory] = useState('today')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [width, setWidth] = useState(1200)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [aiSummary, setAiSummary] = useState<{ article: Article; text: string; loading: boolean } | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)

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
      const endpoint = cat === 'today' ? `${API}/api/pulse/today` : `${API}/api/pulse?category=${cat}`
      const res = await fetch(endpoint)
      const data = await res.json()
      setArticles(data.articles || [])
      setLastUpdated(new Date())
    } catch { setArticles([]) }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchNews(category) }, [category, fetchNews])

  const filtered = articles.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.summary.toLowerCase().includes(search.toLowerCase())
  )

  const featured = filtered[0]
  const rest = filtered.slice(1)

  const getAISummary = async (article: Article) => {
    setAiSummary({ article, text: '', loading: true })
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Summarize this Indian legal news article for an advocate in 3-4 bullet points. Focus on legal implications, relevant laws/sections, and what it means for practitioners:\n\nTitle: ${article.title}\n\nContent: ${article.summary}`,
          history: [],
          system: 'You are a senior Indian advocate. Summarize legal news concisely in bullet points. Focus on practical implications for advocates. Be brief and specific.',
        }),
      })
      const data = await res.json()
      setAiSummary({ article, text: data.reply, loading: false })
    } catch {
      setAiSummary({ article, text: 'Could not generate summary. Please try again.', loading: false })
    }
  }

  const saveToVault = async (article: Article) => {
    if (!token) { window.location.href = '/login'; return }
    const id = article.url
    setSavingId(id)
    try {
      await fetch(`${API}/api/vault/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: article.title, content: `Source: ${article.url}\n\n${article.summary}`, source: 'LexPulse' }),
      })
      setSavedIds(prev => new Set([...prev, id]))
    } catch {}
    setSavingId(null)
  }

  const askAI = (article: Article) => {
    const q = encodeURIComponent(`Tell me more about this legal news: ${article.title}. What are the legal implications under Indian law?`)
    window.location.href = `/assistant?q=${q}`
  }

  const bg = '#080809'; const surface = 'rgba(255,255,255,0.03)'
  const border = 'rgba(255,255,255,0.08)'; const tp = '#ffffff'
  const tm = 'rgba(255,255,255,0.6)'; const td = 'rgba(255,255,255,0.3)'
  const gold = '#C7A56A'
  const activeCat = CATEGORIES.find(c => c.id === category)

  const ArticleActions = ({ article, small = false }: { article: Article; small?: boolean }) => {
    const isSaved = savedIds.has(article.url)
    const isSaving = savingId === article.url
    const btnStyle = (color: string, bg: string) => ({
      padding: small ? '4px 8px' : '5px 10px',
      background: bg,
      border: `1px solid ${color}33`,
      borderRadius: 6,
      color,
      fontSize: 11,
      cursor: 'pointer',
      fontFamily: 'inherit',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      whiteSpace: 'nowrap' as const,
      transition: 'all 0.15s',
    })
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }} onClick={e => e.preventDefault()}>
        <button style={btnStyle(gold, 'rgba(199,165,106,0.1)')} onClick={() => getAISummary(article)}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          AI Summary
        </button>
        <button style={btnStyle('#6366f1', 'rgba(99,102,241,0.1)')} onClick={() => askAI(article)}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          Ask AI
        </button>
        <button style={btnStyle(isSaved ? '#3fb950' : '#10b981', isSaved ? 'rgba(63,185,80,0.1)' : 'rgba(16,185,129,0.1)')} onClick={() => !isSaved && saveToVault(article)} disabled={isSaving}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
        </button>
        <button style={btnStyle(tm, 'rgba(255,255,255,0.05)')} onClick={() => { navigator.clipboard.writeText(article.url) }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          Share
        </button>
      </div>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: bg, color: tp, fontFamily: 'system-ui,sans-serif', paddingBottom: isMobile ? 80 : 40 }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
        .article-card:hover{background:rgba(255,255,255,0.05)!important;border-color:rgba(255,255,255,0.14)!important;transform:translateY(-2px)}
        .featured-card:hover{border-color:rgba(199,165,106,0.3)!important}
        .cat-btn:hover{background:rgba(255,255,255,0.06)!important}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        input::placeholder{color:rgba(255,255,255,0.25)}
      `}</style>

      {/* NAV */}
      <nav style={{ borderBottom:`1px solid ${border}`, padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(8,8,9,0.95)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <BackButton />
          <button onClick={() => window.location.href='/about'} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer' }}>
            <LogoMark size={20} color={tp}/>
            <span style={{ fontSize:14, fontWeight:700, color:tp }}>LexIndia</span>
          </button>
          <span style={{ color:td }}>·</span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round"><polyline points="2 12 6 12 8 5 11 19 14 9 16 15 18 12 22 12"/></svg>
            <span style={{ fontSize:14, fontWeight:600, color:gold }}>LexPulse</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {lastUpdated && !isMobile && <span style={{ fontSize:11, color:td }}>Updated {formatDate(lastUpdated.toISOString())}</span>}
          <button onClick={() => fetchNews(category, true)} disabled={refreshing} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:surface, border:`1px solid ${border}`, borderRadius:8, color:tm, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation:refreshing?'spin 0.8s linear infinite':'none' }}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:1000, margin:'0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>

        {/* HEADER */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:'#3fb950', boxShadow:'0 0 8px #3fb950', animation:'pulse 2s ease-in-out infinite' }}/>
            <span style={{ fontSize:11, color:'#3fb950', letterSpacing:'1px', textTransform:'uppercase', fontWeight:600 }}>Live Feed</span>
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ fontSize: isMobile ? 24 : 32, fontWeight:800, color:tp, letterSpacing:-1, marginBottom:4 }}>Legal News India</h1>
              <p style={{ fontSize:13, color:tm }}>Supreme Court · High Courts · Legislation · Legal developments</p>
            </div>
            {/* Search */}
            <div style={{ position:'relative', width: isMobile ? '100%' : 260 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={td} strokeWidth="2" strokeLinecap="round" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search news..." style={{ width:'100%', background:surface, border:`1px solid ${border}`, borderRadius:8, padding:'8px 12px 8px 30px', fontSize:12, color:tp, outline:'none', boxSizing:'border-box' }} onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.2)'} onBlur={e => e.target.style.borderColor=border}/>
            </div>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:20, marginBottom:4 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} className="cat-btn" onClick={() => { setCategory(cat.id); setSearch('') }}
              style={{ padding:'7px 16px', background: category===cat.id ? `${cat.color}20` : surface, border:`1px solid ${category===cat.id ? cat.color+'55' : border}`, borderRadius:20, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight: category===cat.id ? 700 : 400, color: category===cat.id ? cat.color : tm, whiteSpace:'nowrap', transition:'all 0.2s', flexShrink:0 }}>
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'grid', gap:12 }}>
            <SkeletonCard featured/>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:12 }}>
              {Array.from({length:4}).map((_,i) => <SkeletonCard key={i}/>)}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:td }}>
            <div style={{ fontSize:14 }}>No articles found{search ? ` for "${search}"` : ''}.</div>
          </div>
        ) : (
          <div>
            {/* FEATURED ARTICLE */}
            {featured && (
              <a href={featured.url} target="_blank" rel="noopener noreferrer" className="featured-card"
                style={{ display:'block', background:'rgba(199,165,106,0.04)', border:`1px solid rgba(199,165,106,0.15)`, borderRadius:16, padding: isMobile ? '20px' : '28px', textDecoration:'none', marginBottom:16, transition:'all 0.2s', animation:'fadeIn 0.4s ease', borderLeft:`3px solid ${gold}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:getSourceColor(featured.source) }}/>
                  <span style={{ fontSize:11, color:getSourceColor(featured.source), fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>{getSourceName(featured.source)}</span>
                  {featured.date && <span style={{ fontSize:11, color:td }}>· {formatDate(featured.date)}</span>}
                  <span style={{ fontSize:11, color:td }}>· {estimateReadTime(featured.summary)} min read</span>
                  <span style={{ marginLeft:'auto', fontSize:10, background:'rgba(199,165,106,0.15)', color:gold, padding:'2px 8px', borderRadius:10, fontWeight:600 }}>FEATURED</span>
                </div>
                <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, color:tp, lineHeight:1.4, marginBottom:12 }}>{featured.title}</h2>
                <p style={{ fontSize:14, color:tm, lineHeight:1.7, marginBottom:16 }}>{featured.summary}</p>
                <ArticleActions article={featured}/>
              </a>
            )}

            {/* REST OF ARTICLES */}
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:12 }}>
              {rest.map((article, i) => (
                <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="article-card"
                  style={{ display:'block', background:surface, border:`1px solid ${border}`, borderRadius:12, padding:'18px', textDecoration:'none', transition:'all 0.2s', animation:`fadeIn 0.4s ease ${i*0.04}s both`, borderLeft:`2px solid ${getSourceColor(article.source)}` }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:11, color:getSourceColor(article.source), fontWeight:700, textTransform:'uppercase', letterSpacing:'0.3px' }}>{getSourceName(article.source)}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      {article.date && <span style={{ fontSize:10, color:td }}>{formatDate(article.date)}</span>}
                      <span style={{ fontSize:10, color:td }}>{estimateReadTime(article.summary)} min</span>
                    </div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color:tp, lineHeight:1.5, marginBottom:8 }}>{article.title}</div>
                  <div style={{ fontSize:12, color:tm, lineHeight:1.6, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>{article.summary}</div>
                  <ArticleActions article={article} small/>
                </a>
              ))}
            </div>

            {filtered.length > 0 && (
              <div style={{ textAlign:'center', marginTop:32, fontSize:12, color:td }}>
                {filtered.length} articles · {activeCat?.label}
                {search && ` · filtered by "${search}"`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI SUMMARY MODAL */}
      {aiSummary && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:100, display:'flex', alignItems:'flex-end', justifyContent:'center', padding: isMobile ? 0 : 24 }} onClick={() => setAiSummary(null)}>
          <div style={{ background:'#0d0d0f', border:`1px solid ${border}`, borderRadius: isMobile ? '16px 16px 0 0' : 16, width:'100%', maxWidth:640, maxHeight:'80vh', overflow:'auto', animation:'fadeIn 0.2s ease' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span style={{ fontSize:13, fontWeight:600, color:gold }}>AI Summary</span>
              </div>
              <button onClick={() => setAiSummary(null)} style={{ background:'transparent', border:'none', color:td, cursor:'pointer', fontSize:16 }}>✕</button>
            </div>
            <div style={{ padding:'16px 20px' }}>
              <div style={{ fontSize:13, fontWeight:600, color:tp, marginBottom:12, lineHeight:1.5 }}>{aiSummary.article.title}</div>
              {aiSummary.loading ? (
                <div style={{ display:'flex', gap:5, padding:'20px 0' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:gold, animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>)}
                </div>
              ) : (
                <div style={{ fontSize:13, color:tm, lineHeight:1.8, whiteSpace:'pre-wrap' }}>{aiSummary.text}</div>
              )}
              {!aiSummary.loading && (
                <div style={{ display:'flex', gap:8, marginTop:16 }}>
                  <button onClick={() => askAI(aiSummary.article)} style={{ padding:'8px 16px', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:8, color:'#6366f1', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Ask AI More</button>
                  <a href={aiSummary.article.url} target="_blank" rel="noopener noreferrer" style={{ padding:'8px 16px', background:surface, border:`1px solid ${border}`, borderRadius:8, color:tm, fontSize:12, textDecoration:'none' }}>Read Full Article</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}