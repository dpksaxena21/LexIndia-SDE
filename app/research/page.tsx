'use client'
import { useAuth } from '../auth/AuthContext'
import { useState, useEffect, useRef } from 'react'

function LogoMark({ size = 32, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="1"  width="5" height="5" rx="1" fill={color} opacity="0.25"/>
      <rect x="4" y="7"  width="5" height="5" rx="1" fill={color} opacity="0.45"/>
      <rect x="4" y="13" width="5" height="5" rx="1" fill={color} opacity="0.65"/>
      <rect x="4" y="19" width="5" height="5" rx="1" fill={color} opacity="0.85"/>
      <rect x="4" y="25" width="5" height="5" rx="1" fill={color}/>
      <rect x="12" y="7"  width="5" height="5" rx="1" fill={color} opacity="0.25"/>
      <rect x="12" y="13" width="5" height="5" rx="1" fill={color} opacity="0.5"/>
      <rect x="12" y="19" width="5" height="5" rx="1" fill={color} opacity="0.8"/>
      <rect x="12" y="25" width="5" height="5" rx="1" fill={color}/>
      <rect x="20" y="25" width="5" height="5" rx="1" fill={color} opacity="0.6"/>
      <rect x="27" y="25" width="5" height="5" rx="1" fill={color} opacity="0.3"/>
    </svg>
  )
}

function BackButton() {
  if (typeof window === 'undefined') return null
  if (window.history.length <= 1) return null
  return (
    <button
      onClick={() => window.history.back()}
      style={{
        position: 'fixed', top: 12, right: 16, left: 'auto', zIndex: 999,
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

function LoadingState() {
  const [status, setStatus] = useState(0)
  const statuses = ['Searching Indian Kanoon', 'Fetching case law', 'Reading judgments', 'Generating AI analysis', 'Almost ready']
  useEffect(() => {
    const t = setInterval(() => setStatus(s => (s + 1) % statuses.length), 1200)
    return () => clearInterval(t)
  }, [])
  const DOTS = [
    {x:0,y:0,o:0.25},{x:0,y:1,o:0.45},{x:0,y:2,o:0.65},
    {x:0,y:3,o:0.85},{x:0,y:4,o:1},{x:1,y:1,o:0.25},
    {x:1,y:2,o:0.5},{x:1,y:3,o:0.8},{x:1,y:4,o:1},
    {x:2,y:4,o:0.6},{x:3,y:4,o:0.3},
  ]
  const STEP = 10, OX = 8, OY = 2
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'100px 0', gap:20 }}>
      <style>{`@keyframes dp{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1)}}`}</style>
      <svg width="48" height="52" viewBox="0 0 48 52">
        {DOTS.map((d,i) => (
          <rect key={i} x={OX + d.x*STEP} y={OY + d.y*STEP} width="8" height="8" rx="2" fill="white"
            style={{ opacity:d.o, animation:`dp 1.4s ease-in-out ${i*0.1}s infinite` }}
          />
        ))}
      </svg>
      <div style={{ fontSize:11, letterSpacing:3, color:'rgba(255,255,255,0.35)', textTransform:'uppercase' }}>
        {statuses[status]}
      </div>
      <div style={{ width:160, height:2, background:'rgba(255,255,255,0.06)', borderRadius:1, overflow:'hidden' }}>
        <style>{`@keyframes ps{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
        <div style={{ height:'100%', width:'40%', background:'rgba(255,255,255,0.5)', borderRadius:1, animation:'ps 1.3s ease-in-out infinite' }}/>
      </div>
    </div>
  )
}

function renderMarkdown(text: string, dark: boolean) {
  const c1 = dark ? '#ffffff' : '#0a0a0b'
  const c2 = dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)'
  const c3 = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const c4 = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const bl = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'

  // Process tables first — group rows into proper <table>
  text = text.replace(/((?:^\|.+\|\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').filter(r => r.trim())
    let html = `<div style="overflow-x:auto;margin:16px 0;"><table style="width:100%;border-collapse:collapse;font-size:13px;">`
    let isFirst = true
    for (const row of rows) {
      if (/^\|[-| :]+\|$/.test(row.trim())) continue
      const cells = row.split('|').filter(c => c.trim())
      if (isFirst) {
        html += `<thead><tr>${cells.map(c => `<th style="padding:8px 12px;text-align:left;border-bottom:2px solid ${c4};color:${c1};font-weight:600;font-size:12px;letter-spacing:0.3px;white-space:nowrap;">${c.trim()}</th>`).join('')}</tr></thead><tbody>`
        isFirst = false
      } else {
        html += `<tr>${cells.map(c => `<td style="padding:8px 12px;border-bottom:1px solid ${c4};color:${c2};line-height:1.6;vertical-align:top;">${c.trim()}</td>`).join('')}</tr>`
      }
    }
    html += `</tbody></table></div>`
    return html
  })

  return text
    .replace(/^#### (.+)$/gm, `<h4 style="font-size:11px;font-weight:600;color:${c3};margin:16px 0 6px;letter-spacing:0.8px;text-transform:uppercase;">$1</h4>`)
    .replace(/^### (.+)$/gm, `<h3 style="font-size:12px;font-weight:700;color:${c3};margin:20px 0 8px;letter-spacing:1.2px;text-transform:uppercase;">$1</h3>`)
    .replace(/^## (.+)$/gm, `<h2 style="font-size:16px;font-weight:700;color:${c1};margin:28px 0 10px;letter-spacing:-0.3px;border-bottom:1px solid ${c4};padding-bottom:8px;">$1</h2>`)
    .replace(/^# (.+)$/gm, `<h1 style="font-size:20px;font-weight:800;color:${c1};margin:0 0 20px;letter-spacing:-0.5px;">$1</h1>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${c1};font-weight:700;">$1</strong>`)
    .replace(/\*(.+?)\*/g, `<em style="color:${c2};">$1</em>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:10px;margin:5px 0;align-items:flex-start;"><span style="color:${bl};margin-top:5px;font-size:9px;">&#9658;</span><span style="font-size:14px;color:${c2};line-height:1.75;">$1</span></div>`)
    .replace(/^(\d+)\. (.+)$/gm, `<div style="display:flex;gap:10px;margin:5px 0;align-items:flex-start;"><span style="color:${c3};font-size:12px;min-width:18px;font-weight:600;">$1.</span><span style="font-size:14px;color:${c2};line-height:1.75;">$2</span></div>`)
    .replace(/\n\n/g, `<div style="height:10px"></div>`)
}

export default function Research() {
  const { token } = useAuth()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [activeCase, setActiveCase] = useState(0)
  const [saved, setSaved] = useState(false)
  const [dark, setDark] = useState(true)
  const [typed, setTyped] = useState('')
  const [winW, setWinW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const handleResize = () => setWinW(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const typeRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const placeholders = [
    'Search Section 302 IPC murder...',
    'Find anticipatory bail judgments...',
    'Article 21 right to life cases...',
    'Cheque bounce Section 138 NI Act...',
    'POCSO Act child protection...',
    'Habeas corpus writ petitions...',
  ]

  useEffect(() => {
    let pi = 0, ci = 0, deleting = false
    function tick() {
      const word = placeholders[pi]
      if (!deleting) {
        setTyped(word.slice(0, ci + 1))
        ci++
        if (ci === word.length) {
          deleting = true
          typeRef.current = setTimeout(tick, 1800)
          return
        }
      } else {
        setTyped(word.slice(0, ci - 1))
        ci--
        if (ci === 0) {
          deleting = false
          pi = (pi + 1) % placeholders.length
        }
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
    setLoading(true)
    setResults(null)
    setActiveCase(0)
    setSaved(false)
    try {
      const res = await fetch('https://lexindia-backend-production.up.railway.app/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ query: sq }),
      })
      if (!res.ok || !res.body) throw new Error('Backend error')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let aiText = ''
      let cases: any[] = []
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(6))
            if (json.type === 'cases') {
              cases = json.cases
              setResults((prev: any) => ({ ...prev, cases, ai_summary: '' }))
              setLoading(false)
            } else if (json.type === 'done') {
              setLoading(false)
            } else if (json.type === 'text') {
              aiText += json.content
              setResults((prev: any) => ({ ...prev, cases, ai_summary: aiText }))
            }
          } catch {}
        }
      }
    } catch (e) {
      setResults({ error: 'Could not connect to backend.' })
      setLoading(false)
    }
  }

  const bg        = dark ? '#080809'                : '#F8F8F6'
  const bgSurface = dark ? '#0d0d0f'                : '#ffffff'
  const border    = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const borderHi  = dark ? 'rgba(255,255,255,0.2)'  : 'rgba(0,0,0,0.2)'
  const tp        = dark ? '#ffffff'                : '#0a0a0b'
  const tm        = dark ? 'rgba(255,255,255,0.6)'  : 'rgba(0,0,0,0.6)'
  const td        = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)'
  const navBg     = dark ? 'rgba(8,8,9,0.92)'       : 'rgba(248,248,246,0.92)'
  const inputBg   = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const btnBg     = dark ? '#ffffff'                : '#0a0a0b'
  const btnTxt    = dark ? '#000000'                : '#ffffff'
  const logoColor = dark ? '#ffffff'                : '#0a0a0b'
  const abg       = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const abgH      = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const openCase = (tid: string) => {
    window.open('https://indiankanoon.org/doc/' + tid + '/', '_blank')
  }

  const chips = [
    'Section 302 IPC murder',
    'Anticipatory bail BNSS',
    'Article 21 right to life',
    'Cheque bounce Section 138',
    'POCSO Act 2012',
    'Habeas corpus writ',
    'Dowry harassment 498A',
    'Sedition Section 124A',
  ]

  const related = [
    'Bail conditions India',
    'Section 304 IPC',
    'Murder vs culpable homicide',
    'Death penalty rarest of rare',
    'Right to fair trial',
  ]

  return (
    <main style={{ minHeight:'100vh', background:bg, color:tp, fontFamily:'system-ui,sans-serif', transition:'background 0.3s,color 0.3s' }}>
      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .case-item { animation:slideUp 0.3s ease forwards; opacity:0; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
      `}</style>

      <nav style={{ borderBottom:`1px solid ${border}`, padding:'12px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10, background:navBg, backdropFilter:'blur(12px)', transition:'background 0.3s,border-color 0.3s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <BackButton />
          <button onClick={() => window.location.href = '/about'} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', flexShrink:0 }}>
          <LogoMark size={28} color={logoColor}/>
          <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
            <span style={{ fontSize:14, fontWeight:800, color:tp, letterSpacing:3 }}>LEX</span>
            <span style={{ fontSize:14, fontWeight:200, color:tp, letterSpacing:3 }}>INDIA</span>
          </div>
        </button>
        </div>
        <div style={{ display:'flex', gap:24, fontSize:13, alignItems:'center' }}>
          <span style={{ color:tp, fontWeight:600, cursor:'pointer' }} onClick={() => window.location.href='/research'}>Research</span>
          <span style={{ color:td, cursor:'pointer' }} onClick={() => window.location.href='/assistant'}>Assistant</span>
          <span style={{ color:td, cursor:'pointer' }} onClick={() => window.location.href='/drafts'}>Drafts</span>
          <button onClick={() => setDark(d => !d)} style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', border:`1px solid ${border}`, borderRadius:20, padding:'5px 12px', cursor:'pointer', fontSize:11, color:td, fontFamily:'inherit', transition:'all 0.3s', letterSpacing:1 }}>
            {dark ? '○ Light' : '● Dark'}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:1140, margin:'0 auto', padding:'0 24px' }}>

        {!results && !loading && (
          <div style={{ textAlign:'center', padding:'80px 0 48px' }}>
            <div style={{ fontSize:10, letterSpacing:3, color:td, marginBottom:12, textTransform:'uppercase' }}>LexSearch</div>
            <h1 style={{ fontSize:40, fontWeight:800, color:tp, letterSpacing:-1.5, marginBottom:12 }}>Search Indian Case Law</h1>
            <p style={{ fontSize:15, color:tm, lineHeight:1.7, marginBottom:48 }}>
              27 crore judgments · Supreme Court · High Courts · District Courts<br/>Instant AI legal analysis for practising advocates
            </p>
            <div style={{ position:'relative', maxWidth:600, margin:'0 auto 32px' }}>
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder={typed}
                style={{ width:'100%', background:inputBg, border:`1px solid ${border}`, borderRadius:12, padding:'16px 130px 16px 20px', fontSize:15, color:tp, fontFamily:'inherit', outline:'none', transition:'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = borderHi} onBlur={e => e.target.style.borderColor = border}
              />
              <button onClick={() => search()} disabled={loading} style={{ position:'absolute', right:6, top:'50%', transform:'translateY(-50%)', background:btnBg, color:btnTxt, border:'none', borderRadius:8, padding:'10px 24px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Search
              </button>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
              {chips.map(q => (
                <button key={q} onClick={() => search(q)} style={{ background:abg, border:`1px solid ${border}`, borderRadius:20, padding:'6px 16px', fontSize:12, color:tm, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}
                  onMouseEnter={e => { const b=e.currentTarget as HTMLButtonElement; b.style.borderColor=borderHi; b.style.color=tp; b.style.background=abgH }}
                  onMouseLeave={e => { const b=e.currentTarget as HTMLButtonElement; b.style.borderColor=border; b.style.color=tm; b.style.background=abg }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && <LoadingState />}

        {results?.error && (
          <div style={{ background:'rgba(255,60,60,0.06)', border:'1px solid rgba(255,60,60,0.15)', borderRadius:10, padding:'16px 20px', color:'rgba(255,100,100,0.9)', fontSize:13, marginTop:40 }}>
            {results.error}
          </div>
        )}

        {results && !results.error && (
          <div style={{ display:'grid', gridTemplateColumns: winW < 768 ? '1fr' : '260px 1fr 220px', gap:16, paddingTop:24, paddingBottom:40 }}>

            <div>
              <div style={{ fontSize:9, letterSpacing:2, color:td, marginBottom:12, textTransform:'uppercase' }}>
                {results.cases?.length || 0} Cases · Indian Kanoon
              </div>
              {results.cases?.map((c: any, i: number) => (
                <div key={i} className="case-item" onClick={() => setActiveCase(i)}
                  style={{ padding:'12px 14px', borderRadius:8, cursor:'pointer', marginBottom:4, background: activeCase === i ? (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)') : 'transparent', borderLeft: `2px solid ${activeCase === i ? (dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)') : 'transparent'}`, transition:'all 0.15s', animationDelay:`${i * 0.05}s` }}
                  onMouseEnter={e => { if (activeCase !== i) (e.currentTarget as HTMLDivElement).style.background = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                  onMouseLeave={e => { if (activeCase !== i) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
                  <div style={{ fontSize:12, fontWeight:600, color: activeCase === i ? tp : tm, lineHeight:1.4, marginBottom:4 }}>
                    {c.title?.replace(/<[^>]*>/g, '').slice(0, 55)}{c.title?.length > 55 ? '...' : ''}
                  </div>
                  <div style={{ fontSize:10, color:td }}>{c.docsource || 'Indian Kanoon'}{c.publishdate ? ' · ' + c.publishdate : ''}</div>
                </div>
              ))}
              <button onClick={() => search(query + ' more judgments')} style={{ width:'100%', marginTop:8, background:'transparent', border:`1px solid ${border}`, borderRadius:8, padding:'8px', fontSize:11, color:td, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}
                onMouseEnter={e => { const b=e.currentTarget as HTMLButtonElement; b.style.color=tp; b.style.borderColor=borderHi }}
                onMouseLeave={e => { const b=e.currentTarget as HTMLButtonElement; b.style.color=td; b.style.borderColor=border }}>
                + Load more cases
              </button>
              <button onClick={() => { setResults(null); setQuery('') }} style={{ width:'100%', marginTop:6, background:'transparent', border:`1px solid ${border}`, borderRadius:8, padding:'8px', fontSize:11, color:td, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}
                onMouseEnter={e => { const b=e.currentTarget as HTMLButtonElement; b.style.color=tp; b.style.borderColor=borderHi }}
                onMouseLeave={e => { const b=e.currentTarget as HTMLButtonElement; b.style.color=td; b.style.borderColor=border }}>
                &#8592; New Search
              </button>
            </div>

            <div style={{ background:bgSurface, border:`1px solid ${border}`, borderRadius:12, padding:'32px', position:'sticky', top:72, maxHeight:'calc(100vh - 100px)', overflowY:'auto', transition:'background 0.3s,border-color 0.3s' }}>
              <div style={{ fontSize:9, letterSpacing:2, color:td, marginBottom:20, textTransform:'uppercase' }}>AI Legal Analysis · {query}</div>
              <div style={{ fontSize:14, color:tm, lineHeight:1.85 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(results.ai_summary || '', dark) }} />
              {results.cases?.[activeCase] && (
                <div style={{ marginTop:32, paddingTop:24, borderTop:`1px solid ${border}` }}>
                  <div style={{ fontSize:9, letterSpacing:2, color:td, marginBottom:10, textTransform:'uppercase' }}>Case Detail</div>
                  <div style={{ fontSize:13, fontWeight:600, color:tp, marginBottom:8, lineHeight:1.4 }}>
                    {results.cases[activeCase].title?.replace(/<[^>]*>/g, '')}
                  </div>
                  <div style={{ fontSize:12, color:tm, lineHeight:1.7 }} dangerouslySetInnerHTML={{ __html: (results.cases[activeCase].headline || results.cases[activeCase].doc || '').slice(0, 400) + '...' }} />
                  {results.cases[activeCase].tid && (
                    <button onClick={() => openCase(results.cases[activeCase].tid)} style={{ display:'inline-block', marginTop:12, fontSize:11, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', background:'none', border:'none', borderBottom:`1px solid ${border}`, cursor:'pointer', fontFamily:'inherit', padding:0, transition:'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = tp}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}>
                      Read full judgment on Indian Kanoon &#8594;
                    </button>
                  )}
                </div>
              )}
            </div>

            <div style={{ position: winW < 768 ? 'relative' : 'sticky', top: winW < 768 ? 0 : 72 }}>
              <div style={{ fontSize:9, letterSpacing:2, color:td, marginBottom:10, textTransform:'uppercase' }}>Actions</div>
              <button onClick={async () => {
                if (!token) { alert('Please sign in to save to vault'); return }
                if (!results?.ai_summary) return
                try {
                  const res = await fetch('https://lexindia-backend-production.up.railway.app/api/vault/save', {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ title: query, content: results.ai_summary, doc_type: 'LexSearch' })
                  })
                  if (res.ok) setSaved(true)
                  else alert('Failed to save')
                } catch { alert('Network error') }
              }} style={{ width:'100%', marginBottom:6, background: saved ? 'rgba(63,185,80,0.1)' : abg, border:`1px solid ${saved ? 'rgba(63,185,80,0.3)' : border}`, borderRadius:8, padding:'11px 14px', fontSize:12, color: saved ? '#3fb950' : tm, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:9, transition:'all 0.2s', textAlign:'left' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                {saved ? '✓ Saved to Vault' : 'Save to Vault'}
              </button>
              <button onClick={() => window.location.href = '/assistant'} style={{ width:'100%', marginBottom:6, background:abg, border:`1px solid ${border}`, borderRadius:8, padding:'11px 14px', fontSize:12, color:tm, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:9, transition:'all 0.2s', textAlign:'left' }}
                onMouseEnter={e => { const b=e.currentTarget as HTMLButtonElement; b.style.background=abgH; b.style.color=tp }}
                onMouseLeave={e => { const b=e.currentTarget as HTMLButtonElement; b.style.background=abg; b.style.color=tm }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Ask LexChat
              </button>
              <button onClick={() => window.location.href = '/drafts'} style={{ width:'100%', marginBottom:24, background:abg, border:`1px solid ${border}`, borderRadius:8, padding:'11px 14px', fontSize:12, color:tm, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:9, transition:'all 0.2s', textAlign:'left' }}
                onMouseEnter={e => { const b=e.currentTarget as HTMLButtonElement; b.style.background=abgH; b.style.color=tp }}
                onMouseLeave={e => { const b=e.currentTarget as HTMLButtonElement; b.style.background=abg; b.style.color=tm }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Draft Document
              </button>
              <div style={{ fontSize:9, letterSpacing:2, color:td, marginBottom:10, textTransform:'uppercase' }}>Related</div>
              {related.map(q => (
                <button key={q} onClick={() => search(q)} style={{ display:'block', width:'100%', textAlign:'left', background:'transparent', border:'none', borderBottom:`1px solid ${border}`, padding:'8px 0', fontSize:11, color:td, cursor:'pointer', fontFamily:'inherit', transition:'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = tp}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = td}>
                  &#8594; {q}
                </button>
              ))}
            </div>

          </div>
        )}
      </div>
    </main>
  )
}