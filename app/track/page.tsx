'use client'
import { useState, useEffect } from 'react'
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

type CaseData = {
  cnr: string; case_number: string; court: string; court_no: number
  state: string; judicial_section: string; status: string; purpose: string
  last_hearing: string; next_hearing: string; judge: string
  petitioner: string; respondent: string; history: any[]; orders: any[]; fir: any
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase()
  const isPending = s === 'PENDING' || s === 'UNKNOWN' || !s
  const isDisposed = s?.includes('DISPOS') || s?.includes('DECIDED') || s?.includes('ALLOWED') || s?.includes('DISMISSED')
  const color = isPending ? '#f59e0b' : isDisposed ? '#10b981' : '#6366f1'
  const bg = isPending ? 'rgba(245,158,11,0.12)' : isDisposed ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)'
  const label = isPending ? 'PENDING' : isDisposed ? 'DISPOSED' : s
  return <span style={{ background: bg, color, border: `1px solid ${color}33`, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>{label}</span>
}

function formatDate(d: string) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return d }
}

export default function LexTrack() {
  const { token } = useAuth()
  const [cnr, setCnr] = useState('')
  const [loading, setLoading] = useState(false)
  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [error, setError] = useState('')
  const [width, setWidth] = useState(1200)
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    setWidth(window.innerWidth); setCanGoBack(window.history.length > 1)
    const h = () => setWidth(window.innerWidth)
    window.addEventListener('resize', h); return () => window.removeEventListener('resize', h)
  }, [])

  const isMobile = width < 768
  const bg = '#080809'; const surface = 'rgba(255,255,255,0.03)'; const border = 'rgba(255,255,255,0.08)'
  const borderHi = 'rgba(255,255,255,0.2)'; const tp = '#ffffff'; const tm = 'rgba(255,255,255,0.6)'
  const td = 'rgba(255,255,255,0.3)'; const gold = '#C7A56A'

  const search = async () => {
    const q = cnr.trim().toUpperCase().replace(/[-\s]/g, '')
    if (!q) return
    setLoading(true); setError(''); setCaseData(null)
    try {
      const res = await fetch(`${API}/api/track/case/${q}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Case not found')
      setCaseData(data)
    } catch (e: any) { setError(e.message || 'Failed to fetch case') }
    setLoading(false)
  }

  const SAMPLE_CNRS = ['DLHC010001232024', 'MHHC010012342023', 'PBHC010056782024']

  return (
    <main style={{ minHeight: '100vh', background: bg, color: tp, fontFamily: 'system-ui,sans-serif' }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        input::placeholder{color:rgba(255,255,255,0.25)}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>

      {canGoBack && (
        <button onClick={() => window.history.back()} style={{ position: 'fixed', top: 14, left: 14, zIndex: 999, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(8,8,9,0.85)', backdropFilter: 'blur(8px)', border: `1px solid ${border}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: tm, fontSize: 12, fontFamily: 'inherit' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
      )}

      <nav style={{ borderBottom: `1px solid ${border}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,8,9,0.95)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => window.location.href = '/about'} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
          <LogoMark size={20} color={tp}/>
          <span style={{ fontSize: 14, fontWeight: 700, color: tp }}>LexIndia</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
          <span style={{ fontSize: 14, fontWeight: 600, color: gold }}>LexTrack</span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <a href="/research" style={{ color: td, textDecoration: 'none' }}>Search</a>
          <a href="/assistant" style={{ color: td, textDecoration: 'none' }}>Chat</a>
          <a href="/vault" style={{ color: td, textDecoration: 'none' }}>Vault</a>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: isMobile ? '32px 16px' : '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeIn 0.4s ease' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(199,165,106,0.1)', border: '1px solid rgba(199,165,106,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>
          </div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: td, marginBottom: 8, textTransform: 'uppercase' }}>LexTrack</div>
          <h1 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, color: tp, letterSpacing: -1, marginBottom: 10 }}>Live Case Tracker</h1>
          <p style={{ fontSize: 15, color: tm, lineHeight: 1.6 }}>Track any Indian court case instantly using CNR number<br/>District Courts · High Courts · Supreme Court</p>
        </div>

        <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: isMobile ? '20px' : '28px', marginBottom: 24, animation: 'fadeIn 0.4s ease 0.1s both' }}>
          <div style={{ fontSize: 11, color: td, marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' }}>CNR Number</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input value={cnr} onChange={e => setCnr(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && search()} placeholder="e.g. DLHC010001232024"
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: `1px solid ${border}`, borderRadius: 10, padding: '12px 16px', fontSize: 15, color: tp, fontFamily: 'monospace', outline: 'none', letterSpacing: '1px' }}
              onFocus={e => e.target.style.borderColor = gold + '66'} onBlur={e => e.target.style.borderColor = border}/>
            <button onClick={search} disabled={loading || !cnr.trim()} style={{ padding: '12px 24px', background: cnr.trim() && !loading ? gold : 'rgba(255,255,255,0.06)', color: cnr.trim() && !loading ? '#000' : td, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: cnr.trim() && !loading ? 'pointer' : 'default', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
              {loading ? <div style={{ width: 16, height: 16, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/> : null}
              {loading ? 'Tracking...' : 'Track Case'}
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{ fontSize: 11, color: td }}>Try: </span>
            {SAMPLE_CNRS.map(c => (
              <button key={c} onClick={() => setCnr(c)} style={{ background: 'transparent', border: 'none', color: tm, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', textDecoration: 'underline', marginRight: 12, padding: 0 }}>{c}</button>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: 'rgba(99,102,241,0.8)', marginBottom: 4, fontWeight: 600 }}>CNR FORMAT</div>
            <div style={{ fontSize: 11, color: td, fontFamily: 'monospace' }}>DLHC · 01 · 000123 · 2024 &nbsp;→&nbsp; <span style={{ color: tm }}>State · District · Case No · Year</span></div>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px 20px', color: '#f87171', fontSize: 14, marginBottom: 24, animation: 'fadeIn 0.3s ease' }}>{error}</div>
        )}

        {caseData && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: isMobile ? '20px' : '28px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 10, color: td, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Case Status</div>
                  <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 800, color: tp, marginBottom: 8, fontFamily: 'monospace' }}>{caseData.cnr}</div>
                  <StatusBadge status={caseData.status}/>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: td, marginBottom: 4 }}>Court</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: tp }}>{caseData.court}</div>
                  <div style={{ fontSize: 12, color: tm }}>{caseData.judicial_section}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Last Hearing', value: formatDate(caseData.last_hearing) },
                  { label: 'Next Hearing', value: formatDate(caseData.next_hearing) || 'Not Scheduled' },
                  { label: 'Purpose', value: caseData.purpose || '—' },
                  { label: 'Court No.', value: caseData.court_no ? `Court ${caseData.court_no}` : '—' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px' }}>
                    <div style={{ fontSize: 10, color: td, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: tp }}>{item.value}</div>
                  </div>
                ))}
              </div>
              {(caseData.petitioner || caseData.respondent) && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
                  {caseData.petitioner && <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px' }}><div style={{ fontSize: 10, color: td, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Petitioner</div><div style={{ fontSize: 13, color: tm }}>{caseData.petitioner}</div></div>}
                  {caseData.respondent && <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px' }}><div style={{ fontSize: 10, color: td, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Respondent</div><div style={{ fontSize: 13, color: tm }}>{caseData.respondent}</div></div>}
                </div>
              )}
            </div>

            {caseData.history && caseData.history.length > 0 && (
              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: isMobile ? '20px' : '28px', marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: td, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Hearing History</div>
                {caseData.history.map((h: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 90, flexShrink: 0, fontSize: 12, color: gold, fontWeight: 600 }}>{formatDate(h.hearingDate || h.date || '')}</div>
                    <div>
                      <div style={{ fontSize: 13, color: tm }}>{h.purpose || h.businessOnDate || '—'}</div>
                      {h.judgeName && <div style={{ fontSize: 11, color: td, marginTop: 3 }}>Judge: {h.judgeName}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => window.location.href = `/assistant?q=${encodeURIComponent(`Tell me about case ${caseData.cnr} - ${caseData.purpose}`)}`}
                style={{ padding: '10px 20px', background: 'rgba(199,165,106,0.1)', border: '1px solid rgba(199,165,106,0.3)', borderRadius: 10, color: gold, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
                Ask LexChat about this case
              </button>
              <button onClick={() => window.location.href = '/research'}
                style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${border}`, borderRadius: 10, color: tm, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Search Related Cases
              </button>
            </div>
          </div>
        )}

        {!caseData && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: td, animation: 'fadeIn 0.4s ease 0.2s both' }}>
            <div style={{ fontSize: 13, marginBottom: 8 }}>Enter a CNR number to track any Indian court case</div>
            <div style={{ fontSize: 11 }}>CNR numbers are printed on all court documents, summons, and orders</div>
          </div>
        )}
      </div>
    </main>
  )
}
