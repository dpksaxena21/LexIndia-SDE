'use client'
import { useAuth } from './auth/AuthContext'
import { useState, useEffect, useRef, useCallback } from 'react'
import UserMenu from './components/UserMenu'

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

type Message = { role: 'user' | 'assistant'; content: string; streaming?: boolean }
type Session = { id: string; title: string; updated_at: string }

type Mode = {
  id: string; name: string; tagline: string; color: string; system: string
  suggestions: { emoji: string; text: string }[]
  icon: React.ReactNode
}

const MODES: Mode[] = [
  {
    id: 'lexchat', name: 'LexChat', tagline: '', color: '#C7A56A',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    system: `You are LexChat, a senior Indian advocate with 50 years of experience. Deep expertise in BNS, BNSS, IPC, CrPC, Indian Evidence Act, Constitution of India. Cite relevant sections and landmark cases. Give practical actionable advice an advocate can use in court.`,
    suggestions: [
      { emoji: '⚖️', text: 'Key differences between IPC and BNS?' },
      { emoji: '🏛️', text: 'Bail provisions under BNSS 2023' },
      { emoji: '📋', text: 'Grounds for anticipatory bail' },
      { emoji: '🔍', text: 'Section 498A IPC — scope and misuse' },
    ]
  },
  {
    id: 'lexsearch', name: 'LexSearch', tagline: 'Case Law Research', color: '#6366f1',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="10" cy="10" r="7"/><line x1="15.5" y1="15.5" x2="21" y2="21"/></svg>,
    system: '',
    suggestions: [
      { emoji: '🔍', text: 'Search bail judgments Supreme Court 2024' },
      { emoji: '📚', text: 'Landmark cases on right to privacy' },
      { emoji: '⚖️', text: 'Maintenance under Section 125 CrPC cases' },
      { emoji: '🏛️', text: 'Constitutional validity of sedition law' },
    ]
  },
  {
    id: 'lexplain', name: 'LexPlain', tagline: 'Kanoon aasaan bhasha mein', color: '#10b981',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="8" r="1" fill="currentColor"/><line x1="12" y1="11" x2="12" y2="16"/></svg>,
    system: `You are LexPlain. Explain Indian laws in simple Hinglish. Avoid jargon, use real examples. Structure: What is the law → What it means for you → What you can do. Remind users to consult a lawyer for their case.`,
    suggestions: [
      { emoji: '🏠', text: 'Tenant ke kya rights hain India mein?' },
      { emoji: '👮', text: 'Police arrest kare toh kya karein?' },
      { emoji: '💔', text: 'Divorce ka process kya hai?' },
      { emoji: '🏭', text: 'Employer salary na de toh?' },
    ]
  },
  {
    id: 'lexconstitute', name: 'Constitution', tagline: 'Constitutional Law', color: '#8b5cf6',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2L3 7v5c0 5 4 9 9 10 5-1 9-5 9-10V7l-9-5z"/></svg>,
    system: `You are LexConstitute, an expert in Indian Constitutional Law. Cover Fundamental Rights, Directive Principles, constitutional bodies, writ jurisdiction, landmark SC judgments. Always cite Articles and cases like Kesavananda Bharati, Maneka Gandhi, etc.`,
    suggestions: [
      { emoji: '📜', text: 'Basic Structure doctrine explained' },
      { emoji: '🗳️', text: 'Fundamental Rights and their limitations' },
      { emoji: '⚖️', text: 'Article 32 vs Article 226 writs' },
      { emoji: '🏛️', text: 'Emergency provisions Articles 352, 356, 360' },
    ]
  },
  {
    id: 'lexdraft', name: 'LexDraft', tagline: 'Draft Legal Documents', color: '#ec4899',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    system: `You are LexDraft, an expert Indian legal document drafter. Draft petitions, applications, agreements, notices and other legal documents. Use correct BNS/BNSS sections for post-July 2024, IPC/CrPC for pre-July 2024. Format properly with cause title, facts, grounds, prayer.`,
    suggestions: [
      { emoji: '📄', text: 'Draft a bail application for theft case' },
      { emoji: '✉️', text: 'Legal notice for cheque bounce' },
      { emoji: '🏠', text: 'Rent agreement for residential property' },
      { emoji: '⚖️', text: 'Complaint under Section 138 NI Act' },
    ]
  },
]

function renderMarkdown(text: string) {
  const c1 = '#ffffff'; const c2 = 'rgba(255,255,255,0.82)'
  const c3 = 'rgba(255,255,255,0.08)'; const c4 = 'rgba(255,255,255,0.5)'
  const bl = 'rgba(255,255,255,0.3)'
  text = text.replace(/((?:^\|.+\|\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').filter(r => r.trim())
    let html = `<div style="overflow-x:auto;margin:12px 0;"><table style="width:100%;border-collapse:collapse;font-size:13px;">`
    let isFirst = true
    for (const row of rows) {
      if (/^\|[-| :]+\|$/.test(row.trim())) continue
      const cells = row.split('|').filter(c => c.trim())
      if (isFirst) {
        html += `<thead><tr>${cells.map(c => `<th style="padding:8px 12px;text-align:left;border-bottom:2px solid rgba(255,255,255,0.12);color:#fff;font-weight:600;font-size:12px;">${c.trim()}</th>`).join('')}</tr></thead><tbody>`
        isFirst = false
      } else {
        html += `<tr>${cells.map(c => `<td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);color:${c2};line-height:1.6;">${c.trim()}</td>`).join('')}</tr>`
      }
    }
    html += `</tbody></table></div>`
    return html
  })
  return text
    .replace(/^### (.+)$/gm, `<h3 style="font-size:12px;font-weight:700;color:${c4};margin:16px 0 7px;letter-spacing:0.5px;text-transform:uppercase;">$1</h3>`)
    .replace(/^## (.+)$/gm, `<h2 style="font-size:15px;font-weight:700;color:${c1};margin:18px 0 8px;border-bottom:1px solid ${c3};padding-bottom:5px;">$1</h2>`)
    .replace(/^# (.+)$/gm, `<h1 style="font-size:18px;font-weight:800;color:${c1};margin:0 0 12px;">$1</h1>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${c1};font-weight:700;">$1</strong>`)
    .replace(/\*(.+?)\*/g, `<em style="color:${c2};">$1</em>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:8px;margin:5px 0;"><span style="color:${bl};font-size:9px;margin-top:5px;">&#9658;</span><span style="font-size:14px;color:${c2};line-height:1.7;">$1</span></div>`)
    .replace(/^(\d+)\. (.+)$/gm, `<div style="display:flex;gap:8px;margin:5px 0;"><span style="color:${c4};font-size:12px;min-width:18px;font-weight:600;">$1.</span><span style="font-size:14px;color:${c2};line-height:1.7;">$2</span></div>`)
    .replace(/\n\n/g, `<div style="height:8px"></div>`)
}

function StreamingMessage({ content, onDone, color }: { content: string; onDone: () => void; color: string }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  useEffect(() => {
    indexRef.current = 0; setDisplayed(''); setDone(false)
    const interval = setInterval(() => {
      if (indexRef.current < content.length) {
        const chunk = Math.floor(Math.random() * 3) + 1
        setDisplayed(content.slice(0, indexRef.current + chunk))
        indexRef.current += chunk
      } else { setDisplayed(content); setDone(true); onDone(); clearInterval(interval) }
    }, 10)
    return () => clearInterval(interval)
  }, [content])
  return (
    <div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(displayed) }}/>
      {!done && <span style={{ display: 'inline-block', width: 2, height: 14, background: color, marginLeft: 2, verticalAlign: 'middle', animation: 'cursorBlink 0.6s step-end infinite' }}/>}
    </div>
  )
}

export default function Home() {
  const { token, user } = useAuth()
  const [mode, setMode] = useState<Mode>(MODES[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [width, setWidth] = useState(1200)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setWidth(window.innerWidth)
    const h = () => setWidth(window.innerWidth)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const isMobile = width < 768

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const fetchSessions = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(`${API}/api/chat/sessions`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setSessions(data.sessions || [])
    } catch {}
  }, [token])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  const switchMode = (m: Mode) => {
    if (m.id === 'lexsearch') { window.location.href = '/research'; return }
    if (m.id === 'lexdraft') { window.location.href = '/drafts'; return }
    setMode(m); setMessages([]); setSessionId(null); setStreamingIndex(null)
  }

  const newChat = () => { setMessages([]); setSessionId(null); setStreamingIndex(null); setSidebarOpen(false) }

  const loadSession = async (sid: string) => {
    if (!token) return
    try {
      const res = await fetch(`${API}/api/chat/sessions/${sid}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setMessages((data.messages || []).map((m: any) => ({ role: m.role, content: m.content })))
      setSessionId(sid); setSidebarOpen(false)
    } catch {}
  }

  const deleteSession = async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!token) return
    await fetch(`${API}/api/chat/sessions/${sid}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setSessions(prev => prev.filter(s => s.id !== sid))
    if (sessionId === sid) newChat()
  }

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    const userMsg: Message = { role: 'user', content: msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ message: msg, history: messages.map(m => ({ role: m.role, content: m.content })), session_id: sessionId, system: mode.system }),
      })
      const data = await res.json()
      if (data.session_id && data.session_id !== sessionId) { setSessionId(data.session_id); fetchSessions() }
      const assistantMsg: Message = { role: 'assistant', content: data.reply, streaming: true }
      const withAssistant = [...newMessages, assistantMsg]
      setMessages(withAssistant)
      setStreamingIndex(withAssistant.length - 1)
    } catch { setMessages([...newMessages, { role: 'assistant', content: 'Server error. Please try again.' }]) }
    setLoading(false)
  }

  const bg = '#080809'; const sidebarBg = '#060608'
  const surface = '#0d0d0f'; const border = 'rgba(255,255,255,0.08)'
  const tp = '#ffffff'; const tm = 'rgba(255,255,255,0.6)'; const td = 'rgba(255,255,255,0.3)'

  return (
    <main style={{ height: '100vh', background: bg, color: tp, fontFamily: 'system-ui,sans-serif', display: 'flex', overflow: 'hidden' }}>
      <style>{`
        textarea { resize: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bubblePop { from{opacity:0;transform:scale(0.92) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes cursorBlink { 50%{opacity:0} }
        @keyframes logoFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .session-item:hover { background: rgba(255,255,255,0.06) !important; }
        .mode-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .suggestion-btn:hover { border-color: rgba(255,255,255,0.2) !important; background: rgba(255,255,255,0.06) !important; transform: translateY(-2px); }
      `}</style>

      {/* SIDEBAR */}
      {(!isMobile || sidebarOpen) && (
        <div style={{ width: isMobile ? '100%' : 260, flexShrink: 0, background: sidebarBg, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', position: isMobile ? 'fixed' : 'relative', inset: isMobile ? 0 : 'auto', zIndex: 50 }}>
          {/* Logo */}
          <div style={{ padding: '16px 14px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LogoMark size={22} color={tp}/>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: tp, letterSpacing: 3 }}>LEX</span>
                <span style={{ fontSize: 14, fontWeight: 200, color: tp, letterSpacing: 3 }}>INDIA</span>
              </div>
            </div>
            {isMobile && <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: td, cursor: 'pointer', fontSize: 18 }}>✕</button>}
          </div>

          {/* New Chat */}
          <div style={{ padding: '10px 10px 6px' }}>
            <button onClick={newChat} style={{ width: '100%', padding: '9px 12px', background: 'rgba(199,165,106,0.08)', border: '1px solid rgba(199,165,106,0.2)', borderRadius: 8, color: '#C7A56A', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Chat
            </button>
          </div>

          {/* Modes */}
          <div style={{ padding: '6px 10px' }}>
            <div style={{ fontSize: 10, color: td, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 2px 6px', fontWeight: 600 }}>Modules</div>
            {MODES.map(m => (
              <button key={m.id} className="mode-btn" onClick={() => switchMode(m)}
                style={{ width: '100%', padding: '9px 10px', background: mode.id === m.id ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2, transition: 'background 0.15s' }}>
                <span style={{ color: mode.id === m.id ? m.color : td, flexShrink: 0 }}>{m.icon}</span>
                <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: mode.id === m.id ? 700 : 400, color: mode.id === m.id ? tp : tm }}>{m.name}</div>
                </div>
                {mode.id === m.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, flexShrink: 0 }}/>}
              </button>
            ))}
            <div style={{ height: 1, background: border, margin: '8px 0' }}/>
            <button className="mode-btn" onClick={() => window.location.href = '/vault'} style={{ width: '100%', padding: '9px 10px', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
              <span style={{ color: td }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
              <span style={{ fontSize: 13, color: tm }}>LexVault</span>
            </button>
            <button className="mode-btn" onClick={() => window.location.href = '/scan'} style={{ width: '100%', padding: '9px 10px', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: td }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 7V4h3"/><path d="M21 7V4h-3"/><path d="M3 17v3h3"/><path d="M21 17v3h-3"/><line x1="3" y1="12" x2="21" y2="12"/></svg></span>
              <span style={{ fontSize: 13, color: tm }}>LexScan</span>
            </button>
          </div>

          {/* Sessions */}
          {sessions.length > 0 && (
            <div style={{ flex: 1, overflow: 'auto', padding: '0 10px', marginTop: 4 }}>
              <div style={{ fontSize: 10, color: td, letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 2px 6px', fontWeight: 600 }}>Recent</div>
              {sessions.slice(0, 20).map(s => (
                <div key={s.id} className="session-item" onClick={() => loadSession(s.id)}
                  style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: sessionId === s.id ? 'rgba(255,255,255,0.08)' : 'transparent', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: tm, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.title}</span>
                  <button onClick={e => deleteSession(s.id, e)} style={{ flexShrink: 0, background: 'none', border: 'none', color: td, cursor: 'pointer', fontSize: 11, padding: '1px 4px' }}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom user */}
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {user ? (
              <>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: tp }}>{user.name}</div>
                  <div style={{ fontSize: 10, color: td }}>{user.email}</div>
                </div>
                <UserMenu/>
              </>
            ) : (
              <button onClick={() => window.location.href = '/login'} style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${border}`, borderRadius: 8, color: tp, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* TOP NAV */}
        <nav style={{ borderBottom: `1px solid ${border}`, padding: '0 16px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,8,9,0.92)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: td, cursor: 'pointer', padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            )}
            <span style={{ color: mode.color, display: 'flex', alignItems: 'center' }}>{mode.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: mode.color }}>{mode.name}</span>
            {!isMobile && <span style={{ fontSize: 12, color: td }}>— {mode.tagline}</span>}
          </div>

          {/* Desktop mode tabs */}
          {!isMobile && (
            <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.03)', border: `1px solid ${border}`, borderRadius: 10, padding: 3 }}>
              {MODES.map(m => (
                <button key={m.id} className="mode-btn" onClick={() => switchMode(m)}
                  style={{ padding: '5px 12px', background: mode.id === m.id ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: mode.id === m.id ? 700 : 400, color: mode.id === m.id ? m.color : td, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>{m.icon}</span>{m.name}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/about" style={{ fontSize: 12, color: td, textDecoration: 'none' }}>About</a>
            {!isMobile && user && <UserMenu/>}
            {!isMobile && !user && (
              <button onClick={() => window.location.href = '/login'} style={{ padding: '6px 16px', background: '#C7A56A', color: '#000', border: 'none', borderRadius: 16, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Sign In</button>
            )}
          </div>
        </nav>

        {/* Mobile mode tabs */}
        {isMobile && (
          <div style={{ display: 'flex', overflowX: 'auto', padding: '8px 12px', gap: 6, borderBottom: `1px solid ${border}`, background: sidebarBg, flexShrink: 0 }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => switchMode(m)}
                style={{ padding: '6px 14px', background: mode.id === m.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${mode.id === m.id ? 'rgba(255,255,255,0.2)' : border}`, borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: mode.id === m.id ? 700 : 400, color: mode.id === m.id ? m.color : td, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {m.name}
              </button>
            ))}
          </div>
        )}

        {/* CHAT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
          <div style={{ maxWidth: 740, margin: '0 auto', paddingBottom: 24 }}>

            {/* Empty state */}
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 220px)' }}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: `rgba(199,165,106,0.08)`, border: `1px solid rgba(199,165,106,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, animation: 'logoFloat 4s ease-in-out infinite' }}>
                  <LogoMark size={28} color="#C7A56A"/>
                </div>
                <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: tp, letterSpacing: -0.5, marginBottom: 6, textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
                  {mode.id === 'lexchat' ? (new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening') + (user ? ', ' + user.name.split(' ')[0] : '') : mode.name}
                </h1>
                <p style={{ fontSize: 14, color: tm, marginBottom: 8, textAlign: 'center', animation: 'fadeUp 0.5s ease 0.1s both' }}>{mode.tagline}</p>
                <p style={{ fontSize: 12, color: td, marginBottom: 36, textAlign: 'center', animation: 'fadeUp 0.5s ease 0.15s both' }}></p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(2,1fr)', gap: 8, width: '100%', maxWidth: 540 }}>
                  {mode.suggestions.map((s, i) => (
                    <button key={i} className="suggestion-btn" onClick={() => send(s.text)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${border}`, borderRadius: 12, padding: '14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s', animation: `fadeUp 0.5s ease ${0.2 + i * 0.07}s both`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      <div style={{ fontSize: 12, color: tm, lineHeight: 1.5 }}>{s.text}</div>
                    </button>
                  ))}
                </div>
                {!user && (
                  <p style={{ fontSize: 11, color: td, marginTop: 32, textAlign: 'center', animation: 'fadeUp 0.5s ease 0.5s both' }}>
                    <button onClick={() => window.location.href = '/login'} style={{ background: 'none', border: 'none', color: '#C7A56A', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, textDecoration: 'underline' }}>Sign in</button>
                    {' '}to save your conversations
                  </p>
                )}
              </div>
            )}

            {/* Messages */}
            {messages.length > 0 && (
              <div style={{ paddingTop: 24 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 20, display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 10, animation: 'bubblePop 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                    {m.role === 'assistant' && (
                      <div style={{ flexShrink: 0, marginTop: 3, width: 28, height: 28, borderRadius: 8, background: 'rgba(199,165,106,0.1)', border: '1px solid rgba(199,165,106,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LogoMark size={14} color="#C7A56A"/>
                      </div>
                    )}
                    {m.role === 'user' && (
                      <div style={{ flexShrink: 0, marginTop: 3, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                    )}
                    <div style={{ maxWidth: m.role === 'user' ? '70%' : '90%' }}>
                      <div style={{ background: m.role === 'user' ? 'rgba(255,255,255,0.07)' : surface, border: `1px solid ${m.role === 'assistant' ? 'rgba(199,165,106,0.12)' : border}`, borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px', padding: '13px 17px' }}>
                        {m.role === 'user' ? (
                          <div style={{ fontSize: 14, color: tp, lineHeight: 1.7 }}>{m.content}</div>
                        ) : m.streaming && i === streamingIndex ? (
                          <StreamingMessage content={m.content} color={mode.color} onDone={() => { setStreamingIndex(null); setMessages(prev => prev.map((msg, idx) => idx === i ? { ...msg, streaming: false } : msg)) }}/>
                        ) : (
                          <div style={{ fontSize: 14, color: tm, lineHeight: 1.85 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}/>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(199,165,106,0.1)', border: '1px solid rgba(199,165,106,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <LogoMark size={14} color="#C7A56A"/>
                    </div>
                    <div style={{ background: surface, border: '1px solid rgba(199,165,106,0.12)', borderRadius: '4px 14px 14px 14px', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: mode.color, animation: `pulse 1.2s ease-in-out ${i * 0.18}s infinite` }}/>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
        </div>

        {/* INPUT */}
        <div style={{ background: 'rgba(8,8,9,0.97)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${border}`, padding: `12px 16px ${isMobile ? '76px' : '16px'}`, flexShrink: 0 }}>
          <div style={{ maxWidth: 740, margin: '0 auto' }}>
            <div style={{ position: 'relative' }}>
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} rows={1}
                placeholder={`Ask ${mode.name} anything about Indian law...`}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${input ? 'rgba(199,165,106,0.4)' : border}`, borderRadius: 14, padding: '13px 56px 13px 18px', fontSize: 14, color: tp, fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s', lineHeight: 1.6, maxHeight: 140, overflowY: 'auto', resize: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'rgba(199,165,106,0.5)'}
                onBlur={e => e.target.style.borderColor = input ? 'rgba(199,165,106,0.4)' : border}
                onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 140) + 'px' }}
              />
              <button onClick={() => send()} disabled={loading || !input.trim()} style={{ position: 'absolute', right: 8, bottom: 8, background: input.trim() && !loading ? '#C7A56A' : 'rgba(255,255,255,0.08)', color: input.trim() && !loading ? '#000' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, width: 38, height: 38, cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: td }}></span>
              {messages.length > 0 && (
                <button onClick={newChat} style={{ background: 'transparent', border: 'none', fontSize: 11, color: td, cursor: 'pointer', fontFamily: 'inherit' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = tp}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = td}>
                  New chat
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}