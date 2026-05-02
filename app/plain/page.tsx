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

type Message = { role: 'user' | 'assistant'; content: string; streaming?: boolean }

function renderMarkdown(text: string) {
  const c1 = '#ffffff'
  const c2 = 'rgba(255,255,255,0.82)'
  const c3 = 'rgba(255,255,255,0.08)'
  const c4 = 'rgba(255,255,255,0.5)'
  const bl = 'rgba(255,255,255,0.3)'

  text = text.replace(/((?:^\|.+\|\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').filter(r => r.trim())
    let html = `<div style="overflow-x:auto;margin:16px 0;"><table style="width:100%;border-collapse:collapse;font-size:13px;">`
    let isFirst = true
    for (const row of rows) {
      if (/^\|[-| :]+\|$/.test(row.trim())) continue
      const cells = row.split('|').filter(c => c.trim())
      if (isFirst) {
        html += `<thead><tr>${cells.map(c => `<th style="padding:8px 12px;text-align:left;border-bottom:2px solid rgba(255,255,255,0.12);color:#fff;font-weight:600;font-size:12px;">${c.trim()}</th>`).join('')}</tr></thead><tbody>`
        isFirst = false
      } else {
        html += `<tr>${cells.map(c => `<td style="padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.06);color:${c2};line-height:1.6;vertical-align:top;">${c.trim()}</td>`).join('')}</tr>`
      }
    }
    html += `</tbody></table></div>`
    return html
  })

  return text
    .replace(/^### (.+)$/gm, `<h3 style="font-size:13px;font-weight:700;color:${c4};margin:20px 0 8px;letter-spacing:0.5px;">$1</h3>`)
    .replace(/^## (.+)$/gm, `<h2 style="font-size:15px;font-weight:700;color:${c1};margin:20px 0 8px;border-bottom:1px solid ${c3};padding-bottom:6px;">$1</h2>`)
    .replace(/^# (.+)$/gm, `<h1 style="font-size:18px;font-weight:800;color:${c1};margin:0 0 12px;">$1</h1>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${c1};font-weight:700;">$1</strong>`)
    .replace(/\*(.+?)\*/g, `<em style="color:${c2};">$1</em>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:8px;margin:5px 0;align-items:flex-start;"><span style="color:${bl};font-size:9px;margin-top:5px;">&#9658;</span><span style="font-size:14px;color:${c2};line-height:1.7;">$1</span></div>`)
    .replace(/^(\d+)\. (.+)$/gm, `<div style="display:flex;gap:8px;margin:5px 0;align-items:flex-start;"><span style="color:${c4};font-size:12px;min-width:18px;font-weight:600;">$1.</span><span style="font-size:14px;color:${c2};line-height:1.7;">$2</span></div>`)
    .replace(/\n\n/g, `<div style="height:8px"></div>`)
}

function StreamingMessage({ content, onDone }: { content: string; onDone: () => void }) {
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
  const tm = 'rgba(255,255,255,0.6)'
  return (
    <div style={{ position:'relative' }}>
      <div style={{ fontSize:14, color:tm, lineHeight:1.85 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(displayed) }}/>
      {!done && <span style={{ display:'inline-block', width:2, height:14, background:tm, marginLeft:2, verticalAlign:'middle', animation:'cursorBlink 0.6s step-end infinite' }}/>}
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      style={{ background: copied ? 'rgba(63,185,80,0.12)' : 'rgba(255,255,255,0.06)', border:`1px solid ${copied ? 'rgba(63,185,80,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius:6, padding:'3px 10px', fontSize:10, color: copied ? '#3fb950' : 'rgba(255,255,255,0.4)', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

const SUGGESTIONS = [
  { emoji: '🏠', text: 'What are my rights as a tenant in India?' },
  { emoji: '👮', text: 'Police ne mujhe arrest kiya — kya kar sakta hoon?' },
  { emoji: '💔', text: 'Divorce ke liye kya process hai India mein?' },
  { emoji: '🏦', text: 'Bank ne loan refuse kar diya — kya karo?' },
  { emoji: '👶', text: 'Child custody ke kya rights hain?' },
  { emoji: '🏭', text: 'Employer ne salary nahi di — kya karu?' },
]

const PLACEHOLDERS = [
  'Koi bhi kanoon poochho — simple bhasha mein samjhayenge...',
  'Ask any law question in simple language...',
  'Apni problem batao — legal haq samjhate hain...',
  'What does this law mean for me?',
]

function TypewriterPlaceholder() {
  const [text, setText] = useState('')
  const [pi, setPi] = useState(0)
  const [ci, setCi] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const td = 'rgba(255,255,255,0.25)'
  useEffect(() => {
    const word = PLACEHOLDERS[pi]
    const timer = setTimeout(() => {
      if (!deleting) {
        setText(word.slice(0, ci + 1))
        if (ci + 1 === word.length) { setTimeout(() => setDeleting(true), 2000) }
        else { setCi(c => c + 1) }
      } else {
        setText(word.slice(0, ci - 1))
        if (ci - 1 === 0) { setDeleting(false); setPi(p => (p + 1) % PLACEHOLDERS.length); setCi(0) }
        else { setCi(c => c - 1) }
      }
    }, deleting ? 28 : 55)
    return () => clearTimeout(timer)
  }, [ci, deleting, pi])
  return (
    <div style={{ position:'absolute', left:18, top:'50%', transform:'translateY(-50%)', fontSize:14, color:td, pointerEvents:'none', whiteSpace:'nowrap', overflow:'hidden', maxWidth:'calc(100% - 60px)' }}>
      {text}<span style={{ display:'inline-block', width:2, height:15, background:td, marginLeft:1, animation:'cursorBlink 0.75s step-end infinite' }}/>
    </div>
  )
}

export default function LexPlain() {
  const { token } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [streamingIndex, setStreamingIndex] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
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
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages, loading])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    const userMsg: Message = { role:'user', content:msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/chat`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}) },
        body: JSON.stringify({
          message: msg,
          history: messages.map(m => ({ role:m.role, content:m.content })),
          system: `You are LexPlain, an AI assistant that explains Indian laws in simple, clear language that any common person can understand — whether they are educated or not. Your job is NOT to give legal advice but to explain what the law says in everyday language.

Rules:
- Use simple Hindi-English mix (Hinglish) when explaining — it helps more people understand
- Avoid complex legal terms. If you must use one, explain it immediately in brackets
- Use real-life examples and analogies
- Structure answers clearly: What is the law → What it means for you → What you can do
- Always remind users to consult a lawyer for their specific case
- Be empathetic — the person asking may be in a difficult situation
- Keep answers focused and practical

Example style: "Yeh kanoon kehta hai ki... (This law says that...) Iska matlab aapke liye yeh hai..."`,
        }),
      })
      const data = await res.json()
      const assistantMsg: Message = { role:'assistant', content:data.reply, streaming:true }
      const withAssistant = [...newMessages, assistantMsg]
      setMessages(withAssistant)
      setStreamingIndex(withAssistant.length - 1)
    } catch {
      setMessages([...newMessages, { role:'assistant', content:'Server se connect nahi ho paya. Thodi der baad try karein.' }])
    }
    setLoading(false)
  }

  const bg        = '#080809'
  const bgSurface = '#0d0d0f'
  const bgUser    = 'rgba(255,255,255,0.07)'
  const border    = 'rgba(255,255,255,0.08)'
  const borderHi  = 'rgba(255,255,255,0.22)'
  const tp        = '#ffffff'
  const tm        = 'rgba(255,255,255,0.6)'
  const td        = 'rgba(255,255,255,0.3)'
  const inputBg   = 'rgba(255,255,255,0.04)'
  const sbg       = 'rgba(255,255,255,0.03)'
  const sbgH      = 'rgba(255,255,255,0.07)'
  const green     = '#10b981'

  return (
    <main style={{ height:'100vh', background:bg, color:tp, fontFamily:'system-ui,sans-serif', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <style>{`
        textarea { resize:none; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:2px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bubblePop { from{opacity:0;transform:scale(0.85) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes cursorBlink { 50%{opacity:0} }
        @keyframes logoFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ borderBottom:`1px solid ${border}`, padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(8,8,9,0.92)', backdropFilter:'blur(12px)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => window.location.href='/'} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer' }}>
            <LogoMark size={22} color={tp}/>
            <span style={{ fontSize:14, fontWeight:700, color:tp, letterSpacing:'-0.3px' }}>LexIndia</span>
          </button>
          <span style={{ color:td, fontSize:13 }}>·</span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:green, boxShadow:`0 0 6px ${green}` }}/>
            <span style={{ fontSize:13, color:green, fontWeight:600 }}>LexPlain</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:16, fontSize:13, alignItems:'center' }}>
          <span style={{ color:td, cursor:'pointer' }} onClick={() => window.location.href='/research'}>Research</span>
          <span style={{ color:td, cursor:'pointer' }} onClick={() => window.location.href='/assistant'}>LexChat</span>
          {!isMobile && <span style={{ color:td, cursor:'pointer' }} onClick={() => window.location.href='/drafts'}>Drafts</span>}
        </div>
      </nav>

      {/* CHAT AREA */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 24px' }}>
        <div style={{ maxWidth:720, margin:'0 auto', paddingBottom:20 }}>

          {messages.length === 0 && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 200px)', opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(24px)', transition:'opacity 0.7s ease,transform 0.7s ease' }}>

              {/* Logo */}
              <div style={{ position:'relative', marginBottom:24, animation:'logoFloat 4s ease-in-out infinite' }}>
                <div style={{ width:64, height:64, borderRadius:16, background:`rgba(16,185,129,0.1)`, border:`1px solid rgba(16,185,129,0.2)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={green} strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9"/>
                    <circle cx="12" cy="8" r="1" fill={green}/>
                    <line x1="12" y1="11" x2="12" y2="16"/>
                  </svg>
                </div>
              </div>

              <div style={{ fontSize:10, letterSpacing:4, color:td, marginBottom:10, textTransform:'uppercase', animation:'fadeUp 0.5s ease 0.1s both' }}>LexPlain</div>
              <h1 style={{ fontSize: isMobile ? 26 : 32, fontWeight:800, color:tp, letterSpacing:-1, marginBottom:8, textAlign:'center', animation:'fadeUp 0.5s ease 0.2s both' }}>
                Kanoon Ko Samjho
              </h1>
              <p style={{ fontSize:14, color:tm, lineHeight:1.7, marginBottom:8, textAlign:'center', animation:'fadeUp 0.5s ease 0.25s both' }}>
                Understand Indian Law in Simple Language
              </p>
              <p style={{ fontSize:12, color:td, lineHeight:1.7, marginBottom:40, textAlign:'center', animation:'fadeUp 0.5s ease 0.3s both' }}>
                No legal jargon · Hindi + English · Common people friendly
              </p>

              {/* Suggestion cards */}
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3,1fr)', gap:8, width:'100%', maxWidth:620 }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={s.text} onClick={() => send(s.text)} style={{ background:sbg, border:`1px solid ${border}`, borderRadius:12, padding:'14px', cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all 0.2s', animation:`fadeUp 0.5s ease ${0.35+i*0.07}s both`, display:'flex', flexDirection:'column', gap:8 }}
                    onMouseEnter={e => { const b=e.currentTarget as HTMLButtonElement; b.style.borderColor='rgba(16,185,129,0.3)'; b.style.background=sbgH; b.style.transform='translateY(-2px)' }}
                    onMouseLeave={e => { const b=e.currentTarget as HTMLButtonElement; b.style.borderColor=border; b.style.background=sbg; b.style.transform='translateY(0)' }}>
                    <span style={{ fontSize:20 }}>{s.emoji}</span>
                    <div style={{ fontSize:11, color:tm, lineHeight:1.5 }}>{s.text}</div>
                  </button>
                ))}
              </div>

              <p style={{ fontSize:11, color:td, marginTop:32, textAlign:'center', lineHeight:1.6 }}>
                ⚠️ LexPlain explains laws for general understanding only.<br/>For your specific case, always consult a qualified advocate.
              </p>
            </div>
          )}

          {messages.length > 0 && (
            <div style={{ paddingTop:32 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom:20, display:'flex', flexDirection: m.role==='user'?'row-reverse':'row', alignItems:'flex-start', gap:10, animation:'bubblePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                  {m.role === 'assistant' && (
                    <div style={{ flexShrink:0, marginTop:3, width:28, height:28, borderRadius:8, background:`rgba(16,185,129,0.12)`, border:`1px solid rgba(16,185,129,0.2)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={green} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="8" r="1" fill={green}/><line x1="12" y1="11" x2="12" y2="16"/></svg>
                    </div>
                  )}
                  {m.role === 'user' && (
                    <div style={{ flexShrink:0, marginTop:3, width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                  <div style={{ maxWidth: m.role==='user'?'70%':'88%', display:'flex', flexDirection:'column', gap:0 }}>
                    <div style={{ background: m.role==='user'?bgUser:bgSurface, border:`1px solid ${m.role==='assistant'?'rgba(16,185,129,0.08)':border}`, borderRadius: m.role==='user'?'14px 4px 14px 14px':'4px 14px 14px 14px', padding:'13px 17px' }}>
                      {m.role === 'user' ? (
                        <div style={{ fontSize:14, color:tp, lineHeight:1.7 }}>{m.content}</div>
                      ) : m.streaming && i === streamingIndex ? (
                        <StreamingMessage content={m.content} onDone={() => { setStreamingIndex(null); setMessages(prev => prev.map((msg, idx) => idx === i ? { ...msg, streaming:false } : msg)) }}/>
                      ) : (
                        <div>
                          <div style={{ fontSize:14, color:tm, lineHeight:1.85 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}/>
                          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8 }}>
                            <CopyButton text={m.content}/>
                            <button onClick={() => window.location.href='/assistant'} style={{ background:'transparent', border:`1px solid ${border}`, borderRadius:6, padding:'3px 10px', fontSize:10, color:td, cursor:'pointer', fontFamily:'inherit' }}>
                              Ask LexChat
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:20, animation:'fadeIn 0.3s ease' }}>
                  <div style={{ flexShrink:0, width:28, height:28, borderRadius:8, background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={green} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="8" r="1" fill={green}/><line x1="12" y1="11" x2="12" y2="16"/></svg>
                  </div>
                  <div style={{ background:bgSurface, border:'1px solid rgba(16,185,129,0.08)', borderRadius:'4px 14px 14px 14px', padding:'16px 20px' }}>
                    <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                      {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:green, animation:`pulse 1.2s ease-in-out ${i*0.18}s infinite` }}/>)}
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
      <div style={{ background:'rgba(8,8,9,0.97)', backdropFilter:'blur(20px)', borderTop:`1px solid ${border}`, padding:'16px 24px 20px', flexShrink:0 }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <div style={{ position:'relative' }}>
            {!focused && !input && <TypewriterPlaceholder/>}
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} rows={1}
              style={{ width:'100%', background:inputBg, border:`1px solid ${focused ? 'rgba(16,185,129,0.4)' : border}`, borderRadius:14, padding:'14px 56px 14px 18px', fontSize:14, color:tp, fontFamily:'inherit', outline:'none', transition:'border-color 0.2s,box-shadow 0.2s', lineHeight:1.6, maxHeight:140, overflowY:'auto', resize:'none', boxShadow: focused ? '0 0 0 3px rgba(16,185,129,0.06)' : 'none' }}
              onInput={e => { const t=e.target as HTMLTextAreaElement; t.style.height='auto'; t.style.height=Math.min(t.scrollHeight,140)+'px' }}
            />
            <button onClick={() => send()} disabled={loading} style={{ position:'absolute', right:8, bottom:8, background: input.trim()&&!loading ? green : 'rgba(255,255,255,0.08)', color: input.trim()&&!loading ? '#000' : 'rgba(255,255,255,0.2)', border:'none', borderRadius:10, width:38, height:38, cursor: input.trim()&&!loading ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
            <span style={{ fontSize:11, color:td }}>
              {messages.length === 0 ? 'Kanoon ko simple bhasha mein samjho · Powered by Claude AI' : `${messages.filter(m=>m.role==='user').length} sawaal · Enter to send`}
            </span>
            {messages.length > 0 && (
              <button onClick={() => { setMessages([]); setStreamingIndex(null) }} style={{ background:'transparent', border:'none', fontSize:11, color:td, cursor:'pointer', fontFamily:'inherit' }}
                onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=tp}
                onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color=td}>
                Naya sawaal
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}