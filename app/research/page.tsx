'use client'
import { useAuth } from '../auth/AuthContext'
import { useState, useEffect, useRef } from 'react'

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

function LoadingState() {
  const [status, setStatus] = useState(0)
  const statuses = ['Searching Indian Kanoon', 'Fetching case law', 'Reading judgments', 'Generating AI analysis', 'Almost ready']
  useEffect(() => {
    const t = setInterval(() => setStatus(s => (s + 1) % statuses.length), 1200)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 0', gap:20 }}>
      <style>{`@keyframes dp{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1)}}`}</style>
      <div style={{ fontSize:11, letterSpacing:3, color:'rgba(255,255,255,0.35)', textTransform:'uppercase' }}>{statuses[status]}</div>
      <div style={{ width:160, height:2, background:'rgba(255,255,255,0.06)', borderRadius:1, overflow:'hidden' }}>
        <style>{`@keyframes ps{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
        <div style={{ height:'100%', width:'40%', background:'rgba(255,255,255,0.5)', borderRadius:1, animation:'ps 1.3s ease-in-out infinite' }}/>
      </div>
    </div>
  )
}

function renderMarkdown(text: string) {
  const c1 = '#ffffff'; const c2 = 'rgba(255,255,255,0.85)'
  const c4 = 'rgba(255,255,255,0.08)'; const c3 = 'rgba(255,255,255,0.5)'
  const bl = 'rgba(255,255,255,0.35)'
  text = text.replace(/((?:^\|.+\|\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').filter(r => r.trim())
    let html = `<div style="overflow-x:auto;margin:16px 0;"><table style="width:100%;border-collapse:collapse;font-size:13px;">`
    let isFirst = true
    for (const row of rows) {
      if (/^\|[-| :]+\|$/.test(row.trim())) continue
      const cells = row.split('|').filter(c => c.trim())
      if (isFirst) {
        html += `<thead><tr>${cells.map(c => `<th style="padding:8px 12px;text-align:left;border-bottom:2px solid ${c4};color:${c1};font-weight:600;font-size:12px;">${c.trim()}</th>`).join('')}</tr></thead><tbody>`
        isFirst = false
      } else {
        html += `<tr>${cells.map(c => `<td style="padding:8px 12px;border-bottom:1px solid ${c4};color:${c2};line-height:1.6;">${c.trim()}</td>`).join('')}</tr>`
      }
    }
    html += `</tbody></table></div>`
    return html
  })
  return text
    .replace(/^## (.+)$/gm, `<h2 style="font-size:16px;font-weight:700;color:${c1};margin:28px 0 10px;border-bottom:1px solid ${c4};padding-bottom:8px;">$1</h2>`)
    .replace(/^### (.+)$/gm, `<h3 style="font-size:12px;font-weight:700;color:${c3};margin:20px 0 8px;letter-spacing:1px;text-transform:uppercase;">$1</h3>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${c1};font-weight:700;">$1</strong>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:10px;margin:5px 0;"><span style="color:${bl};margin-top:5px;font-size:9px;">&#9658;</span><span style="font-size:14px;color:${c2};line-height:1.75;">$1</span></div>`)
    .replace(/^(\d+)\. (.+)$/gm, `<div style="display:flex;gap:10px;margin:5px 0;"><span style="color:${c3};font-size:12px;min-width:18px;font-weight:600;">$1.</span><span style="font-size:14px;color:${c2};line-height:1.75;">$2</span></div>`)
    .replace(/\n\n/g, `<div style="height:10px"></div>`)
}

const TOOLS = [
  { name: 'LexSearch', desc: 'Case law research', path: '/research', color: '#6366f1' },
  { name: 'LexTrack', desc: 'Live case tracking', path: '/track', color: '#C7A56A' },
  { name: 'LexDraft', desc: 'Draft documents', path: '/drafts', color: '#ec4899' },
  { name: 'LexScan', desc: 'Analyze documents', path: '/scan', color: '#f59e0b' },
  { name: 'LexPulse', desc: 'Legal news', path: '/pulse', color: '#3fb950' },
  { name: 'LexVault', desc: 'File manager', path: '/vault', color: '#C7A56A' },
]

const CHIPS = [
  'Section 302 IPC murder', 'Anticipatory bail BNSS', 'Article 21 right to life',
  'Cheque bounce Section 138', 'POCSO Act 2012', 'Habeas corpus writ',
  'Dowry harassment 498A', 'Sedition Section 124A',
]

const RELATED = [
  'Bail conditions India', 'Section 304 IPC', 'Murder vs culpable homicide',
  'Death penalty rarest of rare', 'Right to fair trial',
]

export default function Research() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [activeCase, setActiveCase] = useState(0)
  const [saved, setSaved] = useState(false)
  const [typed, setTyped] = useState('')
  const [width, setWidth] = useState(1200)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const typeRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setWidth(window.innerWidth)
    const h = () => setWidth(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const isMobile = width < 768

  const placeholders = [
    'Search Section 302 IPC murder...', 'Find anticipatory bail judgments...',
    'Article 21 right to life cases...', 'Cheque bounce Section 138 NI Act...',
  ]

  useEffect(() => {
    let pi = 0, ci = 0, deleting = false
    function tick() {
      const word = placeholders[pi]
      if (!deleting) {
        setTyped(word.slice(0, ci + 1)); ci++
        if (ci === word.length) { deleting = true; typeRef.current = setTimeout(tick, 1800); return }
      } else {
        setTyped(word.slice(0, ci - 1)); ci--
        if (ci === 0) { deleting = false; pi = (pi + 1) % placeholders.length }
      }
      typeRef.current = setTimeout(tick, deleting ? 40 : 70)
    }
    typeRef.current = setTimeout(tick, 800)
    return () => { if (typeRef.current) clearTimeout(typeRef.current) }
  }, [])

  const search = async (q?: string) => {
    const sq = q || query
    if (!sq.trim()) return
    if (q) setQuery(q)
    setLoading(true); setResults(null); setActiveCase(0); setSaved(false)
    setSidebarOpen(false)
    try {
      const res = await fetch(`${API}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ query: sq }),
      })
      if (!res.ok || !res.body) throw new Error('Backend error')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let aiText = ''; let cases: any[] = []
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(6))
            if (json.type === 'cases') { cases = json.cases; setResults((prev: any) => ({ ...prev, cases, ai_summary: '' })); setLoading(false) }
            else if (json.type === 'done') { setLoading(false) }
            else if (json.type === 'text') { aiText += json.content; setResults((prev: any) => ({ ...prev, cases, ai_summary: aiText })) }
          } catch {}
        }
      }
    } catch { setResults({ error: 'Could not connect to backend.' }); setLoading(false) }
  }

  const bg = '#080809'; const sidebarBg = '#060608'
  const surface = '#0d0d0f'; const border = 'rgba(255,255,255,0.08)'
  const borderHi = 'rgba(255,255,255,0.2)'; const tp = '#ffffff'
  const tm = 'rgba(255,255,255,0.6)'; const td = 'rgba(255,255,255,0.3)'
  const gold = '#C7A56A'

  return (
    <main style={{ height: '100vh', background: bg, color: tp, fontFamily: 'system-ui,sans-serif', display: 'flex', overflow: 'hidden' }}>
      <style>{`
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .tool-btn:hover{background:rgba(255,255,255,0.06)!important}
        .case-item:hover{background:rgba(255,255,255,0.05)!important}
        .chip-btn:hover{border-color:rgba(255,255,255,0.3)!important;color:#fff!important}
        input::placeholder{color:rgba(255,255,255,0.25)}
      `}</style>

      {/* SIDEBAR */}
      {(!isMobile || sidebarOpen) && (
        <div style={{ width: isMobile ? '100%' : 220, flexShrink: 0, background: sidebarBg, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', position: isMobile ? 'fixed' : 'relative', inset: isMobile ? 0 : 'auto', zIndex: isMobile ? 50 : 1 }}>
          {/* Logo */}
          <div style={{ padding: '14px 12px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => window.location.href = '/about'} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
              <LogoMark size={18} color={tp}/>
              <span style={{ fontSize: 13, fontWeight: 700, color: tp }}>LexIndia</span>
            </button>
            {isMobile && <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: td, cursor: 'pointer', fontSize: 18 }}>✕</button>}
          </div>

          {/* AI Modes */}
          <div style={{ padding: '10px 8px 4px' }}>
            <div style={{ fontSize: 10, color: td, letterSpacing: '1px', textTransform: 'uppercase', padding: '6px 4px 4px', fontWeight: 600 }}>AI Modes</div>
            {[
              { name: 'LexChat', path: '/assistant', color: gold },
              { name: 'LexPlain', path: '/assistant', color: '#10b981' },
              { name: 'Constitution', path: '/assistant', color: '#6366f1' },
            ].map(m => (
              <button key={m.name} className="tool-btn" onClick={() => window.location.href = m.path}
                style={{ width: '100%', padding: '7px 10px', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, transition: 'background 0.15s', textAlign: 'left' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, flexShrink: 0 }}/>
                <span style={{ fontSize: 12, color: tm }}>{m.name}</span>
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: border, margin: '4px 8px' }}/>

          {/* Tools */}
          <div style={{ padding: '4px 8px', flex: 1, overflow: 'auto' }}>
            <div style={{ fontSize: 10, color: td, letterSpacing: '1px', textTransform: 'uppercase', padding: '6px 4px 4px', fontWeight: 600 }}>Tools</div>
            {TOOLS.map(t => (
              <button key={t.name} className="tool-btn" onClick={() => window.location.href = t.path}
                style={{ width: '100%', padding: '8px 10px', background: t.path === '/research' ? 'rgba(99,102,241,0.1)' : 'transparent', border: t.path === '/research' ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, transition: 'background 0.15s', textAlign: 'left' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, flexShrink: 0 }}/>
                <div>
                  <div style={{ fontSize: 12, fontWeight: t.path === '/research' ? 700 : 400, color: t.path === '/research' ? '#6366f1' : tm }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: td }}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* About */}
          <div style={{ padding: '8px', borderTop: `1px solid ${border}` }}>
            <button className="tool-btn" onClick={() => window.location.href = '/about'}
              style={{ width: '100%', padding: '9px 12px', background: 'rgba(199,165,106,0.08)', border: '1px solid rgba(199,165,106,0.2)', borderRadius: 8, color: gold, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              About LexIndia
            </button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* TOP NAV */}
        <nav style={{ borderBottom: `1px solid ${border}`, padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,8,9,0.92)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: td, cursor: 'pointer', padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            )}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"><circle cx="10" cy="10" r="7"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#6366f1' }}>LexSearch</span>
            <span style={{ fontSize: 11, color: td }}>— 27 crore judgments</span>
          </div>
          {results && (
            <button onClick={() => { setResults(null); setQuery('') }}
              style={{ background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, padding: '5px 12px', fontSize: 12, color: td, cursor: 'pointer', fontFamily: 'inherit' }}>
              ← New Search
            </button>
          )}
        </nav>

        {/* CONTENT */}
        <div style={{ flex: 1, overflow: 'auto' }}>

          {/* EMPTY STATE */}
          {!results && !loading && (
            <div style={{ maxWidth: 640, margin: '0 auto', padding: isMobile ? '48px 16px' : '64px 24px', textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
              <h1 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 800, color: tp, letterSpacing: -1.5, marginBottom: 10 }}>Search Indian Case Law</h1>
              <p style={{ fontSize: 14, color: tm, marginBottom: 36 }}>27 crore judgments · Supreme Court · High Courts · District Courts</p>
              <div style={{ position: 'relative', marginBottom: 24 }}>
                <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
                  placeholder={typed}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${border}`, borderRadius: 12, padding: '14px 120px 14px 20px', fontSize: 15, color: tp, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = borderHi} onBlur={e => e.target.style.borderColor = border}/>
                <button onClick={() => search()} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: tp, color: bg, border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Search</button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {CHIPS.map(q => (
                  <button key={q} className="chip-btn" onClick={() => search(q)}
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${border}`, borderRadius: 20, padding: '6px 14px', fontSize: 12, color: tm, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && <LoadingState />}

          {results?.error && (
            <div style={{ margin: '40px 24px', background: 'rgba(255,60,60,0.06)', border: '1px solid rgba(255,60,60,0.15)', borderRadius: 10, padding: '16px 20px', color: 'rgba(255,100,100,0.9)', fontSize: 13 }}>{results.error}</div>
          )}

          {/* RESULTS */}
          {results && !results.error && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '220px 1fr 180px', gap: 0, height: '100%' }}>

              {/* Case list */}
              <div style={{ borderRight: `1px solid ${border}`, overflow: 'auto', padding: '16px 8px' }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: td, marginBottom: 10, textTransform: 'uppercase', padding: '0 8px' }}>
                  {results.cases?.length || 0} Cases
                </div>
                {results.cases?.map((c: any, i: number) => (
                  <div key={i} className="case-item" onClick={() => setActiveCase(i)}
                    style={{ padding: '10px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 3, background: activeCase === i ? 'rgba(255,255,255,0.07)' : 'transparent', borderLeft: `2px solid ${activeCase === i ? 'rgba(255,255,255,0.7)' : 'transparent'}`, transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: activeCase === i ? tp : tm, lineHeight: 1.4, marginBottom: 3 }}>
                      {c.title?.replace(/<[^>]*>/g, '').slice(0, 50)}{c.title?.length > 50 ? '...' : ''}
                    </div>
                    <div style={{ fontSize: 10, color: td }}>{c.docsource || 'Indian Kanoon'}</div>
                  </div>
                ))}
                <button onClick={() => search(query + ' more judgments')}
                  style={{ width: '100%', marginTop: 8, background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, padding: '7px', fontSize: 11, color: td, cursor: 'pointer', fontFamily: 'inherit' }}>
                  + Load more
                </button>
              </div>

              {/* AI Analysis */}
              <div style={{ overflow: 'auto', padding: '24px' }}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: td, marginBottom: 16, textTransform: 'uppercase' }}>AI Legal Analysis · {query}</div>
                <div style={{ fontSize: 14, color: tm, lineHeight: 1.85 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(results.ai_summary || '') }}/>
                {results.cases?.[activeCase] && (
                  <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${border}` }}>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: td, marginBottom: 10, textTransform: 'uppercase' }}>Case Detail</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: tp, marginBottom: 8, lineHeight: 1.4 }}>
                      {results.cases[activeCase].title?.replace(/<[^>]*>/g, '')}
                    </div>
                    <div style={{ fontSize: 12, color: tm, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: (results.cases[activeCase].headline || '').slice(0, 400) + '...' }}/>
                    {results.cases[activeCase].tid && (
                      <button onClick={() => window.open('https://indiankanoon.org/doc/' + results.cases[activeCase].tid + '/', '_blank')}
                        style={{ marginTop: 10, fontSize: 11, color: td, background: 'none', border: 'none', borderBottom: `1px solid ${border}`, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                        Read full judgment →
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              {!isMobile && (
                <div style={{ borderLeft: `1px solid ${border}`, padding: '16px 12px', overflow: 'auto' }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: td, marginBottom: 10, textTransform: 'uppercase' }}>Actions</div>
                  <button onClick={async () => {
                    if (!token) { alert('Please sign in to save'); return }
                    if (!results?.ai_summary) return
                    try {
                      const res = await fetch(`${API}/api/vault/save`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ title: query, content: results.ai_summary, doc_type: 'LexSearch' })
                      })
                      if (res.ok) setSaved(true)
                    } catch {}
                  }} style={{ width: '100%', marginBottom: 6, background: saved ? 'rgba(63,185,80,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${saved ? 'rgba(63,185,80,0.3)' : border}`, borderRadius: 8, padding: '10px 12px', fontSize: 12, color: saved ? '#3fb950' : tm, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {saved ? '✓ Saved' : 'Save to Vault'}
                  </button>
                  <button onClick={() => window.location.href = '/assistant'}
                    style={{ width: '100%', marginBottom: 6, background: 'rgba(255,255,255,0.04)', border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', fontSize: 12, color: tm, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    Ask LexChat
                  </button>
                  <button onClick={() => window.location.href = '/drafts'}
                    style={{ width: '100%', marginBottom: 20, background: 'rgba(255,255,255,0.04)', border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', fontSize: 12, color: tm, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    Draft Document
                  </button>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: td, marginBottom: 8, textTransform: 'uppercase' }}>Related</div>
                  {RELATED.map(q => (
                    <button key={q} onClick={() => search(q)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderBottom: `1px solid ${border}`, padding: '7px 0', fontSize: 11, color: td, cursor: 'pointer', fontFamily: 'inherit' }}>
                      → {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}