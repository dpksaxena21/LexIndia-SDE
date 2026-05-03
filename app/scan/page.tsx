'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../auth/AuthContext'
import Link from 'next/link'

const API = 'https://lexindia-backend-production.up.railway.app'

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="1" width="5" height="5" rx="1" fill="#fff" opacity="0.25"/>
      <rect x="4" y="7" width="5" height="5" rx="1" fill="#fff" opacity="0.45"/>
      <rect x="4" y="13" width="5" height="5" rx="1" fill="#fff" opacity="0.65"/>
      <rect x="4" y="19" width="5" height="5" rx="1" fill="#fff" opacity="0.85"/>
      <rect x="4" y="25" width="5" height="5" rx="1" fill="#fff"/>
      <rect x="12" y="7" width="5" height="5" rx="1" fill="#fff" opacity="0.25"/>
      <rect x="12" y="13" width="5" height="5" rx="1" fill="#fff" opacity="0.5"/>
      <rect x="12" y="19" width="5" height="5" rx="1" fill="#fff" opacity="0.8"/>
      <rect x="12" y="25" width="5" height="5" rx="1" fill="#fff"/>
      <rect x="20" y="25" width="5" height="5" rx="1" fill="#fff" opacity="0.6"/>
      <rect x="27" y="25" width="5" height="5" rx="1" fill="#fff" opacity="0.3"/>
    </svg>
  )
}

function MarkdownBlock({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div style={{ fontSize: 13, lineHeight: 1.75, color: '#d4d0c8' }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h3 key={i} style={{ fontSize: 13, fontWeight: 700, color: '#F4F1EA', margin: '20px 0 8px', letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.7 }}>{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} style={{ fontSize: 16, fontWeight: 700, color: '#F4F1EA', margin: '24px 0 12px', letterSpacing: '-0.3px' }}>{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}><span style={{ opacity: 0.4, flexShrink: 0 }}>·</span><span>{line.slice(2)}</span></div>
        if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ fontWeight: 600, color: '#F4F1EA', marginBottom: 4 }}>{line.slice(2, -2)}</div>
        if (line === '') return <div key={i} style={{ height: 8 }} />
        return <p key={i} style={{ margin: '0 0 6px' }}>{line}</p>
      })}
    </div>
  )
}

function BackButton() {
  if (typeof window === 'undefined') return null
  if (window.history.length <= 1) return null
  return (
    <button
      onClick={() => window.history.back()}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(255,255,255,0.4)', fontSize: 12, padding: '4px 8px',
        borderRadius: 6, transition: 'color 0.15s', fontFamily: 'inherit',
        flexShrink: 0,
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Back
    </button>
  )
}

export default function LexScanPage() {
  const { user, token } = useAuth()
  const [dark] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [filename, setFilename] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [width, setWidth] = useState(1200)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setWidth(window.innerWidth)
    const h = () => setWidth(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const isMobile = width < 768

  const bg = '#0A0A0B'
  const surface = 'rgba(255,255,255,0.03)'
  const border = 'rgba(255,255,255,0.08)'
  const gold = '#C7A56A'
  const tm = 'rgba(255,255,255,0.75)'
  const td = 'rgba(255,255,255,0.35)'

  const handleFile = (f: File) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt']
    const ext = '.' + f.name.split('.').pop()?.toLowerCase()
    if (!allowed.includes(ext)) {
      setError('Unsupported file type. Please upload PDF, DOCX, or TXT.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.')
      return
    }
    setFile(f)
    setError('')
    setAnalysis('')
    setSaved(false)
  }

  const handleScan = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setAnalysis('')
    setSaved(false)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('question', question)

    try {
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${API}/api/scan`, {
        method: 'POST',
        headers,
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Scan failed')
      setAnalysis(data.analysis)
      setFilename(data.filename)
    } catch (e: any) {
      setError(e.message || 'Failed to scan document')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToVault = async () => {
    if (!token) { alert('Please sign in to save'); return }
    if (!analysis) return
    try {
      const res = await fetch(`${API}/api/vault/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: `Scan: ${filename}`, content: analysis, source: 'LexScan' }),
      })
      if (res.ok) setSaved(true)
    } catch { alert('Failed to save') }
  }

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return { color: '#f87171', label: 'PDF' }
    if (ext === 'docx' || ext === 'doc') return { color: '#60a5fa', label: 'DOC' }
    return { color: '#a78bfa', label: 'TXT' }
  }

  return (
    <div style={{ background: bg, color: '#F4F1EA', minHeight: '100vh', fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
        .scan-btn:hover { background: rgba(199,165,106,0.2) !important; }
        .action-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .drop-zone-active { border-color: rgba(199,165,106,0.6) !important; background: rgba(199,165,106,0.04) !important; }
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${border}`, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, background: bg, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BackButton />
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <LogoMark size={22} />
          <span style={{ color: '#F4F1EA', fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>LexIndia</span>
        </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/research" style={{ color: td, fontSize: 13, textDecoration: 'none', padding: '4px 10px' }}>Search</Link>
          <Link href="/assistant" style={{ color: td, fontSize: 13, textDecoration: 'none', padding: '4px 10px' }}>Chat</Link>
          <Link href="/drafts" style={{ color: td, fontSize: 13, textDecoration: 'none', padding: '4px 10px' }}>Draft</Link>
          {user ? (
            <Link href="/dashboard" style={{ color: gold, fontSize: 13, textDecoration: 'none', border: `1px solid rgba(199,165,106,0.3)`, borderRadius: 8, padding: '5px 12px' }}>{user.name.split(' ')[0]}</Link>
          ) : (
            <Link href="/login" style={{ color: gold, fontSize: 13, textDecoration: 'none', border: `1px solid rgba(199,165,106,0.3)`, borderRadius: 8, padding: '5px 12px' }}>Sign in</Link>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, animation: 'fadeUp 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 7V4h3"/><path d="M21 7V4h-3"/><path d="M3 17v3h3"/><path d="M21 17v3h-3"/>
                <rect x="6" y="7" width="12" height="10" rx="1" fill="rgba(99,102,241,0.2)"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
              </svg>
            </div>
            <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>LexScan</h1>
            <span style={{ fontSize: 11, background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>AI Document Analyzer</span>
          </div>
          <p style={{ color: td, fontSize: 14, margin: 0 }}>Upload any legal document — FIR, contract, court order, notice — and get instant AI analysis.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: analysis && !isMobile ? '1fr 1fr' : '1fr', gap: 20 }}>

          {/* Left — Upload Panel */}
          <div style={{ animation: 'fadeUp 0.3s ease' }}>

            {/* Drop Zone */}
            <div
              className={dragging ? 'drop-zone-active' : ''}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              onClick={() => !file && fileInputRef.current?.click()}
              style={{
                border: `1px dashed ${file ? 'rgba(99,102,241,0.4)' : border}`,
                borderRadius: 12, padding: file ? '20px' : '40px 20px',
                background: file ? 'rgba(99,102,241,0.04)' : surface,
                textAlign: 'center', cursor: file ? 'default' : 'pointer',
                marginBottom: 16, transition: 'all 0.2s',
              }}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />

              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: `${getFileIcon(file.name).color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: getFileIcon(file.name).color }}>{getFileIcon(file.name).label}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#F4F1EA', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                    <div style={{ fontSize: 11, color: td, marginTop: 2 }}>{(file.size / 1024).toFixed(0)} KB</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setFile(null); setAnalysis(''); setError('') }} style={{ background: 'transparent', border: 'none', color: td, cursor: 'pointer', padding: 4, borderRadius: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={td} strokeWidth="1.5" strokeLinecap="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: 14, color: tm, fontWeight: 500, marginBottom: 6 }}>Drop document here or click to upload</div>
                  <div style={{ fontSize: 12, color: td }}>PDF, DOCX, TXT · Max 10MB</div>
                </>
              )}
            </div>

            {/* Question input */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: td, marginBottom: 6, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Specific Question (optional)</div>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="e.g. What are the bail conditions? Is there a limitation period issue?"
                rows={3}
                style={{ width: '100%', background: surface, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 12px', color: '#F4F1EA', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Scan Button */}
            <button
              className="scan-btn"
              onClick={handleScan}
              disabled={!file || loading}
              style={{
                width: '100%', padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                background: file && !loading ? 'rgba(199,165,106,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${file && !loading ? 'rgba(199,165,106,0.3)' : border}`,
                color: file && !loading ? gold : td,
                cursor: file && !loading ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 14, height: 14, border: `2px solid ${gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Analyzing document...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 7V4h3"/><path d="M21 7V4h-3"/><path d="M3 17v3h3"/><path d="M21 17v3h-3"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                  </svg>
                  Scan Document
                </>
              )}
            </button>

            {/* Supported formats */}
            <div style={{ marginTop: 16, padding: '12px 14px', background: surface, border: `1px solid ${border}`, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: td, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>What LexScan analyzes</div>
              {['FIR & Police Reports', 'Court Orders & Judgments', 'Contracts & Agreements', 'Legal Notices', 'Bail Applications', 'Charge Sheets'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: gold, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: tm }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Analysis Output */}
          {(analysis || loading) && (
            <div style={{ animation: 'fadeUp 0.3s ease' }}>
              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: '20px', maxHeight: isMobile ? 'none' : 'calc(100vh - 180px)', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: td, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Analysis — {filename}</div>
                  {analysis && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="action-btn" onClick={handleSaveToVault} style={{ background: saved ? 'rgba(63,185,80,0.1)' : 'transparent', border: `1px solid ${saved ? 'rgba(63,185,80,0.3)' : border}`, borderRadius: 6, padding: '5px 10px', fontSize: 11, color: saved ? '#3fb950' : td, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        {saved ? 'Saved' : 'Save'}
                      </button>
                      <button className="action-btn" onClick={() => { const url = `/assistant?context=${encodeURIComponent(analysis.slice(0, 500))}`; window.location.href = url }} style={{ background: 'transparent', border: `1px solid ${border}`, borderRadius: 6, padding: '5px 10px', fontSize: 11, color: td, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                        Ask LexChat
                      </button>
                      <button className="action-btn" onClick={() => window.location.href = '/drafts'} style={{ background: 'transparent', border: `1px solid ${border}`, borderRadius: 6, padding: '5px 10px', fontSize: 11, color: td, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                        Draft Response
                      </button>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[80, 60, 90, 50, 70].map((w, i) => (
                      <div key={i} style={{ height: 12, width: `${w}%`, background: 'rgba(255,255,255,0.06)', borderRadius: 4, animation: 'pulse 1.5s ease infinite', animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                ) : (
                  <MarkdownBlock text={analysis} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}