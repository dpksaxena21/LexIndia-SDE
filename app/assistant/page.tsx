'use client'
import { useAuth } from '../auth/AuthContext'
import { useState, useEffect, useRef } from 'react'

const API = 'https://lexindia-backend-production.up.railway.app'

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

function Icon({ name, color = 'white', size = 20 }: { name: string; color?: string; size?: number }) {
  const s = size
  const sw = 1.5
  const map: Record<string, React.ReactElement> = {
    scale: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill={color} fillOpacity={0.15} stroke={color} strokeWidth={sw}/><path d="M5 8l2 4-2 4M19 8l-2 4 2 4" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/><line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={sw} strokeLinecap="round" opacity={0.4}/></svg>,
    lock: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" fill={color} fillOpacity={0.12} stroke={color} strokeWidth={sw}/><path d="M8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth={sw} strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill={color}/></svg>,
    doc: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill={color} fillOpacity={0.12} stroke={color} strokeWidth={sw} strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke={color} strokeWidth={sw} strokeLinejoin="round" fill="none"/><line x1="8" y1="13" x2="16" y2="13" stroke={color} strokeWidth={sw} strokeLinecap="round"/><line x1="8" y1="17" x2="12" y2="17" stroke={color} strokeWidth={sw} strokeLinecap="round"/></svg>,
    heart: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={color} fillOpacity={0.12} stroke={color} strokeWidth={sw} strokeLinejoin="round"/></svg>,
    building: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" fill={color} fillOpacity={0.12} stroke={color} strokeWidth={sw}/><path d="M3 9h18M9 21V9" stroke={color} strokeWidth={sw} strokeLinecap="round"/><rect x="13" y="13" width="4" height="8" rx="1" fill={color} fillOpacity={0.3}/><rect x="5" y="13" width="2" height="2" rx="0.5" fill={color}/><rect x="5" y="17" width="2" height="2" rx="0.5" fill={color}/></svg>,
    list: <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" fill={color} fillOpacity={0.12} stroke={color} strokeWidth={sw}/><line x1="7" y1="8" x2="17" y2="8" stroke={color} strokeWidth={sw} strokeLinecap="round"/><line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth={sw} strokeLinecap="round"/><line x1="7" y1="16" x2="13" y2="16" stroke={color} strokeWidth={sw} strokeLinecap="round"/></svg>,
  }
  return map[name] || null
}

type Message = { role: 'user' | 'assistant'; content: string; streaming?: boolean; chips?: string[] }
type Session = { id: string; title: string; updated_at: string }

function renderMarkdown(text: string, dark: boolean) {
  const c1 = dark ? '#ffffff' : '#0a0a0b'
  const c2 = dark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.82)'
  const c3 = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const c4 = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const bl = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'

  text = text.replace(/((?:^\|.+\|\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').filter(r => r.trim())
    let html = `<div style="overflow-x:auto;margin:16px 0;"><table style="width:100%;border-collapse:collapse;font-size:13px;">`
    let isFirst = true
    for (const row of rows) {
      if (/^\|[-| :]+\|$/.test(row.trim())) continue
      const cells = row.split('|').filter(c => c.trim())
      if (isFirst) {
        html += `<thead><tr>${cells.map(c => `<th style="padding:8px 12px;text-align:left;border-bottom:2px solid rgba(255,255,255,0.12);color:#fff;font-weight:600;font-size:12px;letter-spacing:0.3px;white-space:nowrap;">${c.trim()}</th>`).join('')}</tr></thead><tbody>`
        isFirst = false
      } else {
        html += `<tr>${cells.map(c => `<td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(255,255,255,0.82);line-height:1.6;vertical-align:top;">${c.trim()}</td>`).join('')}</tr>`
      }
    }
    html += `</tbody></table></div>`
    return html
  })

  return text
    .replace(/^#### (.+)$/gm, `<h4 style="font-size:11px;font-weight:600;color:${c4};margin:16px 0 6px;letter-spacing:0.8px;text-transform:uppercase;">$1</h4>`)
    .replace(/^### (.+)$/gm, `<h3 style="font-size:12px;font-weight:700;color:${c4};margin:20px 0 8px;letter-spacing:1px;text-transform:uppercase;">$1</h3>`)
    .replace(/^## (.+)$/gm, `<h2 style="font-size:15px;font-weight:700;color:${c1};margin:20px 0 8px;letter-spacing:-0.3px;border-bottom:1px solid ${c3};padding-bottom:6px;">$1</h2>`)
    .replace(/^# (.+)$/gm, `<h1 style="font-size:18px;font-weight:800;color:${c1};margin:0 0 12px;">$1</h1>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${c1};font-weight:700;">$1</strong>`)
    .replace(/\*(.+?)\*/g, `<em style="color:${c2};">$1</em>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:8px;margin:5px 0;align-items:flex-start;"><span style="color:${bl};font-size:9px;margin-top:5px;">&#9658;</span><span style="font-size:14px;color:${c2};line-height:1.7;">$1</span></div>`)
    .replace(/^(\d+)\. (.+)$/gm, `<div style="display:flex;gap:8px;margin:5px 0;align-items:flex-start;"><span style="color:${c4};font-size:12px;min-width:18px;font-weight:600;">$1.</span><span style="font-size:14px;color:${c2};line-height:1.7;">$2</span></div>`)
    .replace(/\n\n/g, `<div style="height:8px"></div>`)
}

function extractChips(content: string): string[] {
  const chips: string[] = []
  if (content.includes('bail')) chips.push('Bail conditions India')
  if (content.includes('IPC') || content.includes('BNS')) chips.push('IPC vs BNS comparison')
  if (content.includes('Article') || content.includes('Constitution')) chips.push('Constitutional remedies')
  if (content.includes('Section') || content.includes('section')) chips.push('Related sections')
  if (content.includes('court') || content.includes('Court')) chips.push('Court procedure')
  if (content.includes('evidence') || content.includes('Evidence')) chips.push('Evidence Act provisions')
  return chips.slice(0, 4)
}

const SUGGESTIONS = [
  { icon: 'scale',    text: 'Difference between IPC and BNS?' },
  { icon: 'lock',     text: 'How to file anticipatory bail under BNSS?' },
  { icon: 'doc',      text: 'Section 302 IPC and its BNS equivalent' },
  { icon: 'heart',    text: 'Grounds for divorce under Hindu Marriage Act?' },
  { icon: 'building', text: 'How to challenge a detention order?' },
  { icon: 'list',     text: 'Procedure for filing a PIL in Supreme Court?' },
]

const PLACEHOLDERS = [
  'Ask about Section 302 IPC...',
  'What is anticipatory bail under BNSS?',
  'Explain Article 21 right to life...',
  'How to file a writ petition?',
  'Difference between cognizable and non-cognizable?',
  'What are the grounds for habeas corpus?',
]

function TypewriterPlaceholder({ dark }: { dark: boolean }) {
  const [text, setText] = useState('')
  const [pi, setPi] = useState(0)
  const [ci, setCi] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const td = dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'
  useEffect(() => {
    const word = PLACEHOLDERS[pi]
    const timer = setTimeout(() => {
      if (!deleting) {
        setText(word.slice(0, ci + 1))
        if (ci + 1 === word.length) { setTimeout(() => setDeleting(true), 1800) }
        else { setCi(c => c + 1) }
      } else {
        setText(word.slice(0, ci - 1))
        if (ci - 1 === 0) { setDeleting(false); setPi(p => (p + 1) % PLACEHOLDERS.length); setCi(0) }
        else { setCi(c => c - 1) }
      }
    }, deleting ? 32 : 62)
    return () => clearTimeout(timer)
  }, [ci, deleting, pi])
  return (
    <div style={{ position:'absolute', left:18, top:'50%', transform:'translateY(-50%)', fontSize:14, color:td, pointerEvents:'none', display:'flex', alignItems:'center', whiteSpace:'nowrap', overflow:'hidden' }}>
      {text}
      <span style={{ display:'inline-block', width:2, height:15, background:td, marginLeft:1, animation:'cursorBlink 0.75s step-end infinite' }}/>
    </div>
  )
}

function StreamingMessage({ content, dark, onDone }: { content: string; dark: boolean; onDone: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')
    setDone(false)
    const interval = setInterval(() => {
      if (indexRef.current < content.length) {
        const chunk = Math.floor(Math.random() * 3) + 1
        setDisplayed(content.slice(0, indexRef.current + chunk))
        indexRef.current += chunk
      } else {
        setDisplayed(content)
        setDone(true)
        onDone()
        clearInterval(interval)
      }
    }, 10)
    return () => clearInterval(interval)
  }, [content])
  const tm = dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
  return (
    <div style={{ position:'relative' }}>
      <div style={{ fontSize:14, color:tm, lineHeight:1.85 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(displayed, dark) }}/>
      {!done && <span style={{ display:'inline-block', width:2, height:14, background:tm, marginLeft:2, verticalAlign:'middle', animation:'cursorBlink 0.6s step-end infinite' }}/>}
    </div>
  )
}

function CopyButton({ text, dark }: { text: string; dark: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <button onClick={copy} style={{ background: copied ? 'rgba(63,185,80,0.12)' : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'), border: `1px solid ${copied ? 'rgba(63,185,80,0.3)' : (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`, borderRadius:6, padding:'3px 10px', fontSize:10, color: copied ? '#3fb950' : (dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'), cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', flexShrink:0 }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

function FollowUpChips({ chips, onSelect, dark }: { chips: string[]; onSelect: (s: string) => void; dark: boolean }) {
  if (!chips.length) return null
  return (
    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:10 }}>
      {chips.map(c => (
        <button key={c} onClick={() => onSelect(c)} style={{ background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, borderRadius:20, padding:'4px 12px', fontSize:11, color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s', whiteSpace:'nowrap' }}
          onMouseEnter={e => { const b=e.currentTarget as HTMLButtonElement; b.style.borderColor=dark?'rgba(255,255,255,0.25)':'rgba(0,0,0,0.25)'; b.style.color=dark?'#fff':'#000' }}
          onMouseLeave={e => { const b=e.currentTarget as HTMLButtonElement; b.style.borderColor=dark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'; b.style.color=dark?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)' }}>
          → {c}
        </button>
      ))}
    </div>
  )
}

export default function Assistant() {
  const { token } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dark] = useState(true)
  const [visible, setVisible] = useState(false)
  const [focused, setFocused] = useState(false)
  const [shake, setShake] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(false)
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

  useEffect(() => {
    setTimeout(() => setVisible(true), 80)
    if (isMobile) setSidebarOpen(false)
  }, [isMobile])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  useEffect(() => {
    if (!token) return
    fetch(`${API}/api/chat/sessions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setSessions(d.sessions || []))
      .catch(() => {})
  }, [token])

  const loadSession = async (sessionId: string) => {
    if (!token) return
    setCurrentSessionId(sessionId)
    if (isMobile) setSidebarOpen(false)
    setMessages([])
    setSessionLoading(true)
    try {
      const res = await fetch(`${API}/api/chat/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages.map((m: any) => ({ role: m.role, content: m.content })))
      }
    } catch {}
    setSessionLoading(false)
  }

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!token) return
    await fetch(`${API}/api/chat/sessions/${sessionId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    if (currentSessionId === sessionId) { setCurrentSessionId(null); setMessages([]) }
  }

  const newChat = () => {
    setCurrentSessionId(null)
    setMessages([])
    if (isMobile) setSidebarOpen(false)
  }

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) {
      if (!msg) { setShake(true); setTimeout(() => setShake(false), 500) }
      return
    }
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
        body: JSON.stringify({ message: msg, history: messages.map(m => ({ role: m.role, content: m.content })), session_id: currentSessionId }),
      })
      const data = await res.json()
      if (data.session_id && data.session_id !== currentSessionId) {
        setCurrentSessionId(data.session_id)
        const newSession: Session = { id: data.session_id, title: msg.slice(0, 50), updated_at: new Date().toISOString() }
        setSessions(prev => [newSession, ...prev.filter(s => s.id !== data.session_id)])
      }
      const chips = extractChips(data.reply)
      const assistantMsg: Message = { role: 'assistant', content: data.reply, streaming: true, chips }
      const withAssistant = [...newMessages, assistantMsg]
      setMessages(withAssistant)
      setStreamingIndex(withAssistant.length - 1)
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Could not connect to server. Please try again.' }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const bg        = '#080809'
  const bgSurface = '#0d0d0f'
  const bgUser    = 'rgba(255,255,255,0.07)'
  const border    = 'rgba(255,255,255,0.08)'
  const borderHi  = 'rgba(255,255,255,0.22)'
  const tp        = '#ffffff'
  const tm        = 'rgba(255,255,255,0.6)'
  const td        = 'rgba(255,255,255,0.3)'
  const btnBg     = '#ffffff'
  const btnTxt    = '#000000'
  const inputBg   = 'rgba(255,255,255,0.04)'
  const sbg       = 'rgba(255,255,255,0.03)'
  const sbgH      = 'rgba(255,255,255,0.07)'
  const sidebarBg = '#060608'

  const formatTime = (d: string) => {
    const date = new Date(d)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    if (diff < 86400000) return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    if (diff < 604800000) return date.toLocaleDateString('en-IN', { weekday: 'short' })
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <main style={{ height:'100vh', background:bg, color:tp, fontFamily:'system-ui,sans-serif', display:'flex', overflow:'hidden' }}>
      <style>{`
        textarea { resize:none; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bubblePop { from{opacity:0;transform:scale(0.85) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes logoFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes logoGlow { 0%,100%{filter:drop-shadow(0 0 0px rgba(255,255,255,0))} 50%{filter:drop-shadow(0 0 16px rgba(255,255,255,0.18))} }
        @keyframes cursorBlink { 50%{opacity:0} }
        @keyframes ringPulse { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(2.2);opacity:0} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .session-item:hover { background: rgba(255,255,255,0.06) !important; }
        .session-item:hover .del-btn { opacity: 1 !important; }
      `}</style>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div style={{ width: isMobile ? '100%' : 260, flexShrink:0, background:sidebarBg, borderRight:`1px solid ${border}`, display:'flex', flexDirection:'column', position: isMobile ? 'fixed' : 'relative', inset: isMobile ? 0 : 'auto', zIndex: isMobile ? 50 : 1 }}>
          <div style={{ padding:'16px 12px 12px', borderBottom:`1px solid ${border}` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <button onClick={() => window.location.href='/'} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:0 }}>
                <LogoMark size={20} color={tp}/>
                <span style={{ fontSize:13, fontWeight:700, color:tp, letterSpacing:'-0.3px' }}>LexIndia</span>
              </button>
              <button onClick={() => setSidebarOpen(false)} style={{ background:'transparent', border:'none', color:td, cursor:'pointer', padding:4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <button onClick={newChat} style={{ width:'100%', padding:'8px 12px', background:'rgba(255,255,255,0.06)', border:`1px solid ${border}`, borderRadius:8, color:tp, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8, transition:'all 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.1)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.06)'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Chat
            </button>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'8px 6px' }}>
            {!token ? (
              <div style={{ padding:'20px 12px', textAlign:'center' }}>
                <div style={{ fontSize:12, color:td, marginBottom:10, lineHeight:1.5 }}>Sign in to save chat history</div>
                <button onClick={() => window.location.href='/login'} style={{ padding:'6px 16px', background:'rgba(255,255,255,0.08)', border:`1px solid ${border}`, borderRadius:8, color:tp, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Sign in</button>
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ padding:'20px 12px', textAlign:'center', color:td, fontSize:12, lineHeight:1.6 }}>
                No conversations yet.<br/>Start chatting to save history.
              </div>
            ) : (
              <>
                <div style={{ fontSize:10, color:td, letterSpacing:'1px', textTransform:'uppercase', padding:'4px 8px 8px', fontWeight:600 }}>Recent</div>
                {sessions.map(s => (
                  <div key={s.id} className="session-item" onClick={() => loadSession(s.id)}
                    style={{ padding:'8px 10px', borderRadius:8, cursor:'pointer', marginBottom:2, background: currentSessionId === s.id ? 'rgba(255,255,255,0.08)' : 'transparent', border: `1px solid ${currentSessionId === s.id ? border : 'transparent'}`, display:'flex', alignItems:'center', gap:8, transition:'all 0.1s', position:'relative' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={td} strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink:0 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, color: currentSessionId === s.id ? tp : tm, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontWeight: currentSessionId === s.id ? 500 : 400 }}>{s.title}</div>
                      <div style={{ fontSize:10, color:td, marginTop:2 }}>{formatTime(s.updated_at)}</div>
                    </div>
                    <button className="del-btn" onClick={(e) => deleteSession(s.id, e)}
                      style={{ opacity:0, background:'transparent', border:'none', color:td, cursor:'pointer', padding:2, borderRadius:4, flexShrink:0, transition:'opacity 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#ef4444'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color=td}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/></svg>
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          {token && (
            <div style={{ padding:'12px', borderTop:`1px solid ${border}` }}>
              <button onClick={() => window.location.href='/dashboard'} style={{ width:'100%', padding:'8px 12px', background:'transparent', border:`1px solid ${border}`, borderRadius:8, color:td, fontSize:12, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8 }}
                onMouseEnter={e => { const b=e.currentTarget as HTMLButtonElement; b.style.color=tp; b.style.borderColor=borderHi }}
                onMouseLeave={e => { const b=e.currentTarget as HTMLButtonElement; b.style.color=td; b.style.borderColor=border }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                Dashboard
              </button>
            </div>
          )}
        </div>
      )}

      {/* MAIN AREA */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        <nav style={{ borderBottom:`1px solid ${border}`, padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(8,8,9,0.92)', backdropFilter:'blur(12px)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} style={{ background:'transparent', border:'none', color:td, cursor:'pointer', padding:4, borderRadius:6, display:'flex', alignItems:'center' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color=tp}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color=td}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            )}
            {!sidebarOpen && <button onClick={() => window.location.href='/'} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer' }}><LogoMark size={22} color={tp}/><span style={{ fontSize:14, fontWeight:700, color:tp, letterSpacing:'-0.3px' }}>LexIndia</span></button>}
            <span style={{ fontSize:13, color:td, fontWeight:500 }}>LexChat</span>
          </div>
          <div style={{ display:'flex', gap:16, fontSize:13, alignItems:'center' }}>
            <span style={{ color:td, cursor:'pointer' }} onClick={() => window.location.href='/research'}>Research</span>
            <span style={{ color:td, cursor:'pointer' }} onClick={() => window.location.href='/drafts'}>Drafts</span>
            <span style={{ color:td, cursor:'pointer' }} onClick={() => window.location.href='/scan'}>Scan</span>
            {!token && <button onClick={() => window.location.href='/login'} style={{ padding:'5px 14px', background:'rgba(255,255,255,0.08)', border:`1px solid ${border}`, borderRadius:8, color:tp, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Sign in</button>}
          </div>
        </nav>

        <div style={{ flex:1, overflowY:'auto', padding:'0 24px' }}>
          <div style={{ maxWidth:720, margin:'0 auto', paddingBottom:20 }}>

            {/* Session loading indicator */}
            {sessionLoading && (
              <div style={{ display:'flex', justifyContent:'center', padding:'60px 0', color:td, fontSize:13 }}>
                Loading conversation...
              </div>
            )}

            {!sessionLoading && messages.length === 0 && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 200px)', opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(24px)', transition:'opacity 0.7s ease, transform 0.7s ease' }}>
                <div style={{ position:'relative', marginBottom:32 }}>
                  <div style={{ animation:'logoFloat 4s ease-in-out infinite, logoGlow 4s ease-in-out infinite' }}>
                    <LogoMark size={56} color={tp}/>
                  </div>
                  <div style={{ position:'absolute', inset:-14, borderRadius:10, border:'1px solid rgba(255,255,255,0.14)', animation:'ringPulse 2.5s ease-out infinite', pointerEvents:'none' }}/>
                  <div style={{ position:'absolute', inset:-14, borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', animation:'ringPulse 2.5s ease-out 0.9s infinite', pointerEvents:'none' }}/>
                </div>
                <div style={{ fontSize:10, letterSpacing:4, color:td, marginBottom:14, textTransform:'uppercase', animation:'fadeUp 0.5s ease 0.1s both' }}>LexChat</div>
                <h1 style={{ fontSize:34, fontWeight:800, color:tp, letterSpacing:-1.5, marginBottom:10, textAlign:'center', animation:'fadeUp 0.5s ease 0.2s both' }}>Ask a Legal Question</h1>
                <p style={{ fontSize:12, color:td, lineHeight:1.7, marginBottom:48, textAlign:'center', letterSpacing:1.5, textTransform:'uppercase', animation:'fadeUp 0.5s ease 0.3s both' }}>BNS · BNSS · IPC · CrPC · Constitution · Evidence Act</p>
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3,1fr)', gap:8, width:'100%', maxWidth:620 }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={s.text} onClick={() => send(s.text)} style={{ background:sbg, border:`1px solid ${border}`, borderRadius:14, padding:'16px', cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all 0.2s', animation:`fadeUp 0.5s ease ${0.35+i*0.07}s both`, display:'flex', flexDirection:'column', gap:8 }}
                      onMouseEnter={e => { const b=e.currentTarget as HTMLButtonElement; b.style.borderColor=borderHi; b.style.background=sbgH; b.style.transform='translateY(-2px)' }}
                      onMouseLeave={e => { const b=e.currentTarget as HTMLButtonElement; b.style.borderColor=border; b.style.background=sbg; b.style.transform='translateY(0)' }}>
                      <div style={{ opacity:0.7 }}><Icon name={s.icon} color="white" size={18}/></div>
                      <div style={{ fontSize:11, color:tm, lineHeight:1.5 }}>{s.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!sessionLoading && messages.length > 0 && (
              <div style={{ paddingTop:32 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ marginBottom:20, display:'flex', flexDirection: m.role==='user'?'row-reverse':'row', alignItems:'flex-start', gap:10, animation:'bubblePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                    {m.role === 'assistant' && <div style={{ flexShrink:0, marginTop:3 }}><LogoMark size={22} color={tp}/></div>}
                    {m.role === 'user' && (
                      <div style={{ flexShrink:0, marginTop:3, width:24, height:24, borderRadius:'50%', background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                    )}
                    <div style={{ maxWidth: m.role==='user'?'68%':'88%', display:'flex', flexDirection:'column', gap:0 }}>
                      <div style={{ background: m.role==='user'?bgUser:bgSurface, border:`1px solid ${border}`, borderRadius: m.role==='user'?'14px 4px 14px 14px':'4px 14px 14px 14px', padding:'13px 17px' }}>
                        {m.role === 'user' ? (
                          <div style={{ fontSize:14, color:tp, lineHeight:1.7 }}>{m.content}</div>
                        ) : m.streaming && i === streamingIndex ? (
                          <StreamingMessage content={m.content} dark={dark} onDone={() => {
                            setStreamingIndex(null)
                            setMessages(prev => prev.map((msg, idx) => idx === i ? { ...msg, streaming: false } : msg))
                          }}/>
                        ) : (
                          <div>
                            <div style={{ fontSize:14, color:tm, lineHeight:1.85 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content, dark) }}/>
                            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8 }}>
                              <CopyButton text={m.content} dark={dark}/>
                              {token && <button onClick={async () => {
                                try {
                                  const res = await fetch(`${API}/api/vault/save`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body:JSON.stringify({title:'Chat: '+m.content.slice(0,50), content:m.content, source:'LexChat'}) })
                                  if(res.ok) alert('Saved to Vault')
                                } catch {}
                              }} style={{ background:'transparent', border:`1px solid ${border}`, borderRadius:8, padding:'3px 10px', cursor:'pointer', fontSize:10, color:td, fontFamily:'inherit' }}>Save</button>}
                            </div>
                          </div>
                        )}
                      </div>
                      {m.role === 'assistant' && !m.streaming && m.chips && m.chips.length > 0 && (
                        <FollowUpChips chips={m.chips} dark={dark} onSelect={(s) => send(s)}/>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:20, animation:'fadeIn 0.3s ease' }}>
                    <LogoMark size={22} color={tp}/>
                    <div style={{ background:bgSurface, border:`1px solid ${border}`, borderRadius:'4px 14px 14px 14px', padding:'16px 20px' }}>
                      <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                        {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'rgba(255,255,255,0.5)', animation:`pulse 1.2s ease-in-out ${i*0.18}s infinite` }}/>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div ref={bottomRef}/>
          </div>
        </div>

        <div style={{ background:'rgba(8,8,9,0.97)', backdropFilter:'blur(20px)', borderTop:`1px solid ${border}`, padding:'16px 24px 20px', flexShrink:0 }}>
          <div style={{ maxWidth:720, margin:'0 auto' }}>
            <div style={{ position:'relative', animation: shake ? 'shake 0.4s ease' : 'none' }}>
              {!focused && !input && <TypewriterPlaceholder dark={dark}/>}
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} rows={1}
                style={{ width:'100%', background:inputBg, border:`1px solid ${shake ? 'rgba(255,100,100,0.4)' : focused ? borderHi : border}`, borderRadius:14, padding:'14px 56px 14px 18px', fontSize:14, color:tp, fontFamily:'inherit', outline:'none', transition:'border-color 0.2s, box-shadow 0.2s', lineHeight:1.6, maxHeight:140, overflowY:'auto', resize:'none', boxShadow: focused ? '0 0 0 3px rgba(255,255,255,0.04)' : 'none' }}
                onInput={e => { const t=e.target as HTMLTextAreaElement; t.style.height='auto'; t.style.height=Math.min(t.scrollHeight,140)+'px' }}
              />
              <button onClick={() => send()} disabled={loading} style={{ position:'absolute', right:8, bottom:8, background:input.trim()&&!loading?btnBg:'rgba(255,255,255,0.08)', color:input.trim()&&!loading?btnTxt:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, width:38, height:38, cursor:input.trim()&&!loading?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
              <span style={{ fontSize:11, color:td, letterSpacing:0.5 }}>
                {messages.length === 0 ? 'Powered by Claude AI · Indian law database' : `${messages.filter(m=>m.role==='user').length} message${messages.filter(m=>m.role==='user').length!==1?'s':''} · Enter to send`}
              </span>
              {messages.length > 0 && (
                <button onClick={newChat} style={{ background:'transparent', border:'none', fontSize:11, color:td, cursor:'pointer', fontFamily:'inherit', transition:'color 0.15s' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=tp}
                  onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color=td}>
                  New chat
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && isMobile && (
        <div onClick={() => setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:40 }}/>
      )}
    </main>
  )
}