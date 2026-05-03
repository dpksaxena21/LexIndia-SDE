'use client'
import { useAuth } from '../auth/AuthContext'
import { useState, useEffect, useRef, useCallback } from 'react'

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
  id: string
  name: string
  tagline: string
  color: string
  system: string
  suggestions: { emoji: string; text: string }[]
  icon: React.ReactNode
}

const MODES: Mode[] = [
  {
    id: 'lexchat',
    name: 'LexChat',
    tagline: 'Senior Advocate AI',
    color: '#C7A56A',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    system: `You are LexChat, a senior Indian advocate with 50 years of experience. Deep expertise in BNS, BNSS, IPC, CrPC, Indian Evidence Act, Constitution of India, and all major Indian statutes. You provide precise, practical legal guidance. Always cite relevant sections and landmark cases. Give actionable advice an advocate can use in court.`,
    suggestions: [
      { emoji: '⚖️', text: 'What are the key differences between IPC and BNS?' },
      { emoji: '🏛️', text: 'Explain bail provisions under BNSS 2023' },
      { emoji: '📋', text: 'What grounds can be used for anticipatory bail?' },
      { emoji: '🔍', text: 'Explain Section 498A IPC and its misuse provisions' },
    ]
  },
  {
    id: 'lexplain',
    name: 'LexPlain',
    tagline: 'Kanoon aasaan bhasha mein',
    color: '#10b981',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="8" r="1" fill="currentColor"/><line x1="12" y1="11" x2="12" y2="16"/></svg>,
    system: `You are LexPlain, an AI that explains Indian laws in simple, clear language that any common person can understand. Use simple Hindi-English mix (Hinglish). Avoid complex legal terms — if you must use one, explain it immediately in brackets. Use real-life examples and analogies. Structure: What is the law → What it means for you → What you can do. Always remind users to consult a lawyer for their specific case. Be empathetic.`,
    suggestions: [
      { emoji: '🏠', text: 'What are my rights as a tenant in India?' },
      { emoji: '👮', text: 'Police ne mujhe arrest kiya — kya kar sakta hoon?' },
      { emoji: '💔', text: 'Divorce ke liye kya process hai India mein?' },
      { emoji: '🏭', text: 'Employer ne salary nahi di — kya karu?' },
    ]
  },
  {
    id: 'lexconstitute',
    name: 'LexConstitute',
    tagline: 'Constitutional Law Expert',
    color: '#6366f1',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2L3 7v5c0 5 4 9 9 10 5-1 9-5 9-10V7l-9-5z"/></svg>,
    system: `You are LexConstitute, an expert in Indian Constitutional Law. You have mastery over the Constitution of India, all its Amendments, landmark Supreme Court judgments, and constitutional principles. Cover Fundamental Rights (Part III), Directive Principles (Part IV), Fundamental Duties, Union-State relations, Constitutional bodies, writ jurisdiction, and constitutional interpretation. Always cite specific Articles and landmark cases like Kesavananda Bharati, Maneka Gandhi, etc.`,
    suggestions: [
      { emoji: '📜', text: 'Explain the Basic Structure doctrine of Indian Constitution' },
      { emoji: '🗳️', text: 'What are Fundamental Rights and their limitations?' },
      { emoji: '⚖️', text: 'Difference between Article 32 and Article 226 writs' },
      { emoji: '🏛️', text: 'Explain Emergency provisions under Article 352, 356, 360' },
    ]
  },
  {
    id: 'lexdebate',
    name: 'LexDebate',
    tagline: 'Counter Arguments Generator',
    color: '#ef4444',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 11a9 9 0 01-9 9"/><path d="M3 13a9 9 0 019-9"/><polyline points="18 8 21 11 18 14"/><polyline points="6 16 3 13 6 10"/></svg>,
    system: `You are LexDebate, an expert at generating powerful counter-arguments for Indian legal cases. Given any legal argument or position, you provide: 1) The strongest counter-arguments with legal basis 2) Relevant case law that supports the counter-position 3) Statutory provisions that can be used against the original argument 4) Practical rebuttals an advocate can use in court 5) Weaknesses in the original argument. Be sharp, precise, and adversarial in your analysis.`,
    suggestions: [
      { emoji: '⚔️', text: 'Counter arguments against anticipatory bail being denied' },
      { emoji: '🛡️', text: 'How to counter a Section 138 NI Act cheque bounce case' },
      { emoji: '⚖️', text: 'Arguments against property dispute claim by plaintiff' },
      { emoji: '🔄', text: 'Counter arguments in a divorce case on cruelty grounds' },
    ]
  },
  {
    id: 'lexglobe',
    name: 'LexGlobe',
    tagline: 'International Law Advisor',
    color: '#0ea5e9',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9"/><path d="M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9"/><line x1="3" y1="12" x2="21" y2="12"/></svg>,
    system: `You are LexGlobe, an expert in International Law with focus on how it applies to India. Cover: International treaties and conventions India is party to, WTO and trade law, International Human Rights Law (UDHR, ICCPR, ICESCR), Diplomatic law, International humanitarian law, Cross-border dispute resolution, Extradition treaties, UNCITRAL arbitration, and comparative law between Indian and international legal systems. Always relate international principles to Indian domestic law.`,
    suggestions: [
      { emoji: '🌍', text: 'What international human rights conventions has India signed?' },
      { emoji: '✈️', text: 'How does extradition work between India and other countries?' },
      { emoji: '🤝', text: 'India\'s obligations under WTO agreements' },
      { emoji: '⚖️', text: 'International arbitration options for Indian businesses' },
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
    .replace(/^#### (.+)$/gm, `<h4 style="font-size:11px;font-weight:600;color:${c4};margin:14px 0 6px;letter-spacing:0.8px;text-transform:uppercase;">$1</h4>`)
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
      } else {
        setDisplayed(content); setDone(true); onDone(); clearInterval(interval)
      }
    }, 10)
    return () => clearInterval(interval)
  }, [content])
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(displayed) }}/>
      {!done && <span style={{ display: 'inline-block', width: 2, height: 14, background: color, marginLeft: 2, verticalAlign: 'middle', animation: 'cursorBlink 0.6s step-end infinite' }}/>}
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      style={{ background: copied ? 'rgba(63,185,80,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? 'rgba(63,185,80,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, padding: '3px 10px', fontSize: 10, color: copied ? '#3fb950' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

export default function LexAssistant() {
  const { token } = useAuth()
  const [mode, setMode] = useState<Mode>(MODES[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [visible, setVisible] = useState(false)
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

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])
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

  const switchMode = (newMode: Mode) => {
    setMode(newMode)
    setMessages([])
    setSessionId(null)
    setStreamingIndex(null)
  }

  const newChat = () => {
    setMessages([])
    setSessionId(null)
    setStreamingIndex(null)
    setSidebarOpen(false)
  }

  const loadSession = async (sid: string) => {
    if (!token) return
    try {
      const res = await fetch(`${API}/api/chat/sessions/${sid}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      const msgs: Message[] = (data.messages || []).map((m: any) => ({ role: m.role, content: m.content }))
      setMessages(msgs)
      setSessionId(sid)
      setSidebarOpen(false)
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
        body: JSON.stringify({
          message: msg,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          session_id: sessionId,
          system: mode.system,
        }),
      })
      const data = await res.json()
      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id)
        fetchSessions()
      }
      const assistantMsg: Message = { role: 'assistant', content: data.reply, streaming: true }
      const withAssistant = [...newMessages, assistantMsg]
      setMessages(withAssistant)
      setStreamingIndex(withAssistant.length - 1)
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Server error. Please try again.' }])
    }
    setLoading(false)
  }

  const bg = '#080809'; const sidebarBg = '#060608'
  const surface = '#0d0d0f'; const border = 'rgba(255,255,255,0.08)'
  const tp = '#ffffff'; const tm = 'rgba(255,255,255,0.6)'; const td = 'rgba(255,255,255,0.3)'
  const inputBg = 'rgba(255,255,255,0.04)'

  return (
    <main style={{ height: '100vh', background: bg, color: tp, fontFamily: 'system-ui,sans-serif', display: 'flex', overflow: 'hidden' }}>
      <style>{`
        textarea { resize: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bubblePop { from{opacity:0;transform:scale(0.92) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes cursorBlink { 50%{opacity:0} }
        @keyframes logoFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .session-item:hover { background: rgba(255,255,255,0.06) !important; }
        .mode-tab:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>

      {/* SESSIONS SIDEBAR */}
      {(!isMobile || sidebarOpen) && (
        <div style={{ width: isMobile ? '100%' : 240, flexShrink: 0, background: sidebarBg, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', position: isMobile ? 'fixed' : 'relative', inset: isMobile ? 0 : 'auto', zIndex: isMobile ? 50 : 1 }}>
          {/* Sidebar header */}
          <div style={{ padding: '14px 12px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button onClick={() => window.location.href = '/about'} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
              <LogoMark size={18} color={tp}/>
              <span style={{ fontSize: 13, fontWeight: 700, color: tp }}>LexIndia</span>
            </button>
            {isMobile && <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: td, cursor: 'pointer', fontSize: 18 }}>✕</button>}
          </div>

          <div style={{ padding: '10px 8px' }}>
            <button onClick={newChat} style={{ width: '100%', padding: '9px 12px', background: `rgba(199,165,106,0.08)`, border: `1px solid rgba(199,165,106,0.2)`, borderRadius: 8, color: '#C7A56A', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Chat
            </button>
          </div>

          {/* Mode selector in sidebar */}
          <div style={{ padding: '0 8px 8px' }}>
            <div style={{ fontSize: 10, color: td, letterSpacing: '1px', textTransform: 'uppercase', padding: '6px 4px 4px', fontWeight: 600 }}>Mode</div>
            {MODES.map(m => (
              <button key={m.id} className="mode-tab" onClick={() => switchMode(m)} style={{ width: '100%', padding: '8px 10px', background: mode.id === m.id ? `rgba(${m.color === '#C7A56A' ? '199,165,106' : m.color === '#10b981' ? '16,185,129' : m.color === '#6366f1' ? '99,102,241' : m.color === '#ef4444' ? '239,68,68' : '14,165,233'},0.12)` : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, transition: 'all 0.15s' }}>
                <span style={{ color: mode.id === m.id ? m.color : td }}>{m.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: mode.id === m.id ? m.color : tm }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: td }}>{m.tagline}</div>
                </div>
                {mode.id === m.id && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: m.color, boxShadow: `0 0 6px ${m.color}` }}/>}
              </button>
            ))}
          </div>

          {/* Sessions */}
          {sessions.length > 0 && (
            <div style={{ flex: 1, overflow: 'auto', padding: '0 8px' }}>
              <div style={{ fontSize: 10, color: td, letterSpacing: '1px', textTransform: 'uppercase', padding: '6px 4px 4px', fontWeight: 600 }}>Recent Chats</div>
              {sessions.map(s => (
                <div key={s.id} className="session-item" onClick={() => loadSession(s.id)}
                  style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: sessionId === s.id ? 'rgba(255,255,255,0.08)' : 'transparent', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.15s' }}>
                  <span style={{ fontSize: 12, color: tm, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.title}</span>
                  <button onClick={e => deleteSession(s.id, e)} style={{ flexShrink: 0, background: 'none', border: 'none', color: td, cursor: 'pointer', fontSize: 11, padding: '1px 4px', borderRadius: 3 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* TOP NAV */}
        <nav style={{ borderBottom: `1px solid ${border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,8,9,0.92)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: td, cursor: 'pointer', padding: '4px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: mode.color }}>{mode.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: mode.color }}>{mode.name}</span>
              <span style={{ fontSize: 11, color: td }}>— {mode.tagline}</span>
            </div>
          </div>

          {/* Mode switcher tabs on desktop */}
          {!isMobile && (
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', border: `1px solid ${border}`, borderRadius: 10, padding: 4 }}>
              {MODES.map(m => (
                <button key={m.id} className="mode-tab" onClick={() => switchMode(m)} title={m.tagline}
                  style={{ padding: '5px 12px', background: mode.id === m.id ? `rgba(${m.color === '#C7A56A' ? '199,165,106' : m.color === '#10b981' ? '16,185,129' : m.color === '#6366f1' ? '99,102,241' : m.color === '#ef4444' ? '239,68,68' : '14,165,233'},0.15)` : 'transparent', border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: mode.id === m.id ? 700 : 400, color: mode.id === m.id ? m.color : td, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>{m.icon}</span>
                  {m.name}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href="/research" style={{ fontSize: 12, color: td, textDecoration: 'none' }}>Research</a>
            <a href="/track" style={{ fontSize: 12, color: td, textDecoration: 'none' }}>Track</a>
            <a href="/scan" style={{ fontSize: 12, color: td, textDecoration: 'none' }}>Scan</a>
            <a href="/vault" style={{ fontSize: 12, color: td, textDecoration: 'none' }}>Vault</a>
            <a href="/about" style={{ fontSize: 12, color: '#C7A56A', textDecoration: 'none', fontWeight: 600 }}>About</a>
          </div>
        </nav>

        {/* Mobile mode tabs */}
        {isMobile && (
          <div style={{ display: 'flex', overflowX: 'auto', padding: '8px 12px', gap: 6, borderBottom: `1px solid ${border}`, background: sidebarBg, flexShrink: 0 }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => switchMode(m)}
                style={{ padding: '6px 12px', background: mode.id === m.id ? `rgba(${m.color === '#C7A56A' ? '199,165,106' : m.color === '#10b981' ? '16,185,129' : m.color === '#6366f1' ? '99,102,241' : m.color === '#ef4444' ? '239,68,68' : '14,165,233'},0.15)` : 'rgba(255,255,255,0.04)', border: `1px solid ${mode.id === m.id ? m.color + '44' : border}`, borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: mode.id === m.id ? 700 : 400, color: mode.id === m.id ? m.color : td, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {m.name}
              </button>
            ))}
          </div>
        )}

        {/* CHAT AREA */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', paddingBottom: 20 }}>

            {/* Empty state */}
            {messages.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 260px)', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: `rgba(${mode.color === '#C7A56A' ? '199,165,106' : mode.color === '#10b981' ? '16,185,129' : mode.color === '#6366f1' ? '99,102,241' : mode.color === '#ef4444' ? '239,68,68' : '14,165,233'},0.1)`, border: `1px solid ${mode.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, animation: 'logoFloat 4s ease-in-out infinite' }}>
                  <span style={{ color: mode.color, transform: 'scale(1.5)' }}>{mode.icon}</span>
                </div>
                <div style={{ fontSize: 10, letterSpacing: 4, color: td, marginBottom: 8, textTransform: 'uppercase' }}>{mode.name}</div>
                <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: tp, letterSpacing: -0.5, marginBottom: 6, textAlign: 'center' }}>{mode.tagline}</h1>
                <p style={{ fontSize: 13, color: tm, marginBottom: 36, textAlign: 'center' }}>Powered by Claude AI · Indian Law Specialist</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(2, 1fr)', gap: 8, width: '100%', maxWidth: 560 }}>
                  {mode.suggestions.map((s, i) => (
                    <button key={i} onClick={() => send(s.text)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${border}`, borderRadius: 12, padding: '14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s', animation: `fadeIn 0.5s ease ${0.1 + i * 0.07}s both`, display: 'flex', flexDirection: 'column', gap: 6 }}
                      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = mode.color + '44'; b.style.background = 'rgba(255,255,255,0.06)'; b.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = border; b.style.background = 'rgba(255,255,255,0.03)'; b.style.transform = 'translateY(0)' }}>
                      <span style={{ fontSize: 20 }}>{s.emoji}</span>
                      <div style={{ fontSize: 12, color: tm, lineHeight: 1.5 }}>{s.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.length > 0 && (
              <div style={{ paddingTop: 24 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 20, display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 10, animation: 'bubblePop 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                    {/* Avatar */}
                    {m.role === 'assistant' && (
                      <div style={{ flexShrink: 0, marginTop: 3, width: 28, height: 28, borderRadius: 8, background: `rgba(${mode.color === '#C7A56A' ? '199,165,106' : mode.color === '#10b981' ? '16,185,129' : mode.color === '#6366f1' ? '99,102,241' : mode.color === '#ef4444' ? '239,68,68' : '14,165,233'},0.12)`, border: `1px solid ${mode.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: mode.color, transform: 'scale(0.8)' }}>{mode.icon}</span>
                      </div>
                    )}
                    {m.role === 'user' && (
                      <div style={{ flexShrink: 0, marginTop: 3, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                    )}
                    {/* Bubble */}
                    <div style={{ maxWidth: m.role === 'user' ? '70%' : '90%' }}>
                      <div style={{ background: m.role === 'user' ? 'rgba(255,255,255,0.07)' : surface, border: `1px solid ${m.role === 'assistant' ? mode.color + '18' : border}`, borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px', padding: '13px 17px' }}>
                        {m.role === 'user' ? (
                          <div style={{ fontSize: 14, color: tp, lineHeight: 1.7 }}>{m.content}</div>
                        ) : m.streaming && i === streamingIndex ? (
                          <StreamingMessage content={m.content} color={mode.color} onDone={() => { setStreamingIndex(null); setMessages(prev => prev.map((msg, idx) => idx === i ? { ...msg, streaming: false } : msg)) }}/>
                        ) : (
                          <div>
                            <div style={{ fontSize: 14, color: tm, lineHeight: 1.85 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}/>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                              <CopyButton text={m.content}/>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
                    <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, background: `rgba(${mode.color === '#C7A56A' ? '199,165,106' : mode.color === '#10b981' ? '16,185,129' : mode.color === '#6366f1' ? '99,102,241' : mode.color === '#ef4444' ? '239,68,68' : '14,165,233'},0.12)`, border: `1px solid ${mode.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: mode.color, transform: 'scale(0.8)' }}>{mode.icon}</span>
                    </div>
                    <div style={{ background: surface, border: `1px solid ${mode.color}18`, borderRadius: '4px 14px 14px 14px', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: mode.color, animation: `pulse 1.2s ease-in-out ${i * 0.18}s infinite` }}/>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={bottomRef}/>
          </div>
        </div>

        {/* INPUT BAR */}
        <div style={{ background: 'rgba(8,8,9,0.97)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${border}`, padding: '12px 16px 16px', flexShrink: 0 }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ position: 'relative' }}>
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} rows={1}
                placeholder={`Ask ${mode.name}...`}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                style={{ width: '100%', background: inputBg, border: `1px solid ${input ? mode.color + '44' : border}`, borderRadius: 14, padding: '13px 56px 13px 18px', fontSize: 14, color: tp, fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s', lineHeight: 1.6, maxHeight: 140, overflowY: 'auto', resize: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = mode.color + '66'}
                onBlur={e => e.target.style.borderColor = input ? mode.color + '44' : border}
                onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 140) + 'px' }}
              />
              <button onClick={() => send()} disabled={loading || !input.trim()} style={{ position: 'absolute', right: 8, bottom: 8, background: input.trim() && !loading ? mode.color : 'rgba(255,255,255,0.08)', color: input.trim() && !loading ? '#000' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10, width: 38, height: 38, cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: td }}>{mode.name} · {mode.tagline} · Claude AI</span>
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