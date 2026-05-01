'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from './auth/AuthContext'
import UserMenu from './components/UserMenu'

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

const DOTS = [
  { cx: 0, cy: 0, op: 0.25 }, { cx: 0, cy: 1, op: 0.45 },
  { cx: 0, cy: 2, op: 0.65 }, { cx: 0, cy: 3, op: 0.85 },
  { cx: 0, cy: 4, op: 1.0  }, { cx: 1, cy: 1, op: 0.25 },
  { cx: 1, cy: 2, op: 0.5  }, { cx: 1, cy: 3, op: 0.8  },
  { cx: 1, cy: 4, op: 1.0  }, { cx: 2, cy: 4, op: 0.6  },
  { cx: 3, cy: 4, op: 0.3  },
]
const STEP = 20
const OX = 18
const OY = 8

function AnimatedIntro({ onDone }: { onDone: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [wordmark, setWordmark] = useState(false)
  const [tagline, setTagline] = useState(false)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const els: HTMLDivElement[] = []
    DOTS.forEach((d) => {
      const el = document.createElement('div')
      const fx = OX + d.cx * STEP
      const fy = OY + d.cy * STEP
      el.style.cssText = `
        position:absolute; width:14px; height:14px;
        border-radius:3px; background:#ffffff;
        left:${fx}px; top:${fy}px;
        opacity:0; transform:scale(0.3);
        transition:opacity 0.5s ease, transform 0.6s cubic-bezier(0.34,1.56,0.64,1);
      `
      stage.appendChild(el)
      els.push(el)
    })
    const timers: ReturnType<typeof setTimeout>[] = []
    const sorted = [...els].map((el, i) => ({
      el, i,
      dist: Math.sqrt(Math.pow(DOTS[i].cx - 1, 2) + Math.pow(DOTS[i].cy - 2, 2))
    })).sort((a, b) => a.dist - b.dist)
    sorted.forEach(({ el, i }, order) => {
      timers.push(setTimeout(() => {
        el.style.opacity = String(DOTS[i].op)
        el.style.transform = 'scale(1)'
      }, 200 + order * 80))
    })
    timers.push(setTimeout(() => {
      els.forEach(el => {
        el.style.transition = 'transform 0.3s ease'
        el.style.transform = 'scale(1.15)'
      })
    }, 1400))
    timers.push(setTimeout(() => {
      els.forEach(el => { el.style.transform = 'scale(1)' })
    }, 1700))
    timers.push(setTimeout(() => setWordmark(true), 2000))
    timers.push(setTimeout(() => setTagline(true), 2500))
    timers.push(setTimeout(() => {
      els.forEach((el, i) => {
        setTimeout(() => {
          el.style.transition = 'opacity 0.4s ease, transform 0.4s ease'
          el.style.opacity = '0'
          el.style.transform = 'scale(0.5)'
        }, i * 30)
      })
    }, 3000))
    timers.push(setTimeout(() => onDone(), 3600))
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:50, background:'#080809',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:28,
    }}>
      <div ref={stageRef} style={{ position:'relative', width:120, height:120 }}/>
      <div style={{
        display:'flex', alignItems:'baseline', gap:10,
        opacity: wordmark ? 1 : 0,
        transform: wordmark ? 'translateY(0)' : 'translateY(10px)',
        transition:'opacity 0.6s ease, transform 0.6s ease',
      }}>
        <span style={{ fontSize:26, fontWeight:800, color:'#fff', letterSpacing:8, fontFamily:'system-ui' }}>LEX</span>
        <span style={{ fontSize:26, fontWeight:200, color:'#fff', letterSpacing:8, fontFamily:'system-ui' }}>INDIA</span>
      </div>
      <div style={{
        fontSize:10, letterSpacing:4, color:'#555',
        textTransform:'uppercase', fontFamily:'system-ui',
        opacity: tagline ? 1 : 0,
        transition:'opacity 0.5s ease',
      }}>
        AI for Justice. Built for India.
      </div>
    </div>
  )
}

function ParticleField({ dark }: { dark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let animId: number
    const rgb = dark ? '255,255,255' : '0,0,0'

    function init() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }
    init()
    window.addEventListener('resize', init)

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      r: Math.random() * 1.5 + 0.5,
      o: Math.random() * 0.4 + 0.1,
    }))

    function draw() {
      const W = canvas!.width
      const H = canvas!.height
      ctx!.clearRect(0, 0, W, H)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${rgb},${p.o})`
        ctx!.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 160) {
            ctx!.beginPath()
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.strokeStyle = `rgba(${rgb},${0.15 * (1 - d / 160)})`
            ctx!.lineWidth = 0.6
            ctx!.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', init)
    }
  }, [dark])

  return (
    <canvas ref={canvasRef} style={{
      position:'fixed', inset:0,
      width:'100vw', height:'100vh',
      pointerEvents:'none',
    }}/>
  )
}

function Marquee({ dark }: { dark: boolean }) {
  const items = ['LAW','·','TECHNOLOGY','·','INTELLIGENCE','·','TRUST','·','INDIA','·','27 CRORE JUDGMENTS','·','BNS','·','BNSS','·','IPC','·','CONSTITUTION OF INDIA','·','ECOURTS','·']
  const doubled = [...items, ...items]
  const dim = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.35)'
  const dot = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)'
  const bdr = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  return (
    <div style={{ overflow:'hidden', borderTop:`1px solid ${bdr}`, borderBottom:`1px solid ${bdr}`, padding:'12px 0' }}>
      <style>{`
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .mtrack { animation:marquee 22s linear infinite; }
        .mtrack:hover { animation-play-state:paused; }
      `}</style>
      <div className="mtrack" style={{ display:'flex', gap:'24px', width:'max-content', alignItems:'center' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{
            fontSize:'10px', letterSpacing:'2px',
            color: item === '·' ? dot : dim,
            whiteSpace:'nowrap', fontWeight: item === '·' ? 400 : 500,
          }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function StatCard({ target, suffix, label, index, textPrimary, textDim, border }: {
  target: number; suffix: string; label: string; index: number;
  textPrimary: string; textDim: string; border: string;
}) {
  const [count, setCount] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    started.current = false
    setCount(0)
    const delay = setTimeout(() => {
      if (started.current) return
      started.current = true
      const steps = 50
      const duration = 1800
      let step = 0
      const timer = setInterval(() => {
        step++
        const eased = 1 - Math.pow(1 - step / steps, 3)
        setCount(Math.floor(eased * target))
        if (step >= steps) { setCount(target); clearInterval(timer) }
      }, duration / steps)
    }, 3800)
    return () => clearTimeout(delay)
  }, [target])

  return (
    <div style={{
      padding: '28px 16px', textAlign: 'center',
      borderRight: index < 3 ? `1px solid ${border}` : 'none',
      transition: 'border-color 0.3s',
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: textPrimary, marginBottom: 4, transition:'color 0.3s', fontVariantNumeric:'tabular-nums' }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: 11, color: textDim, letterSpacing: 1, transition:'color 0.3s' }}>{label}</div>
    </div>
  )
}

const S = 1.5
const F = 0.12

const icons: Record<string, React.ReactNode> = {
  LexSearch: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="10" cy="10" r="7" fill="white" fillOpacity={F} stroke="white" strokeWidth={S} strokeLinecap="round"/><line x1="15.5" y1="15.5" x2="21" y2="21" stroke="white" strokeWidth={S} strokeLinecap="round"/></svg>,
  LexChat: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" fill="white" fillOpacity={F} stroke="white" strokeWidth={S} strokeLinejoin="round"/><line x1="8" y1="9" x2="16" y2="9" stroke="white" strokeWidth={S} strokeLinecap="round"/><line x1="8" y1="13" x2="13" y2="13" stroke="white" strokeWidth={S} strokeLinecap="round"/></svg>,
  LexDraft: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="white" fillOpacity={F} stroke="white" strokeWidth={S} strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="white" strokeWidth={S} strokeLinejoin="round" fill="none"/><line x1="8" y1="13" x2="16" y2="13" stroke="white" strokeWidth={S} strokeLinecap="round"/><line x1="8" y1="17" x2="13" y2="17" stroke="white" strokeWidth={S} strokeLinecap="round"/></svg>,
  LexVault: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" fill="white" fillOpacity={F} stroke="white" strokeWidth={S}/><path d="M7 11V7a5 5 0 0110 0v4" stroke="white" strokeWidth={S} strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill="white"/></svg>,
  LexScan: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 7V4h3" stroke="white" strokeWidth={S} strokeLinecap="round"/><path d="M21 7V4h-3" stroke="white" strokeWidth={S} strokeLinecap="round"/><path d="M3 17v3h3" stroke="white" strokeWidth={S} strokeLinecap="round"/><path d="M21 17v3h-3" stroke="white" strokeWidth={S} strokeLinecap="round"/><rect x="6" y="7" width="12" height="10" rx="1" fill="white" fillOpacity={F}/><line x1="3" y1="12" x2="21" y2="12" stroke="white" strokeWidth={S} strokeLinecap="round"/></svg>,
  LexTrack: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="white" fillOpacity={F} stroke="white" strokeWidth={S}/><polyline points="12 7 12 12 15 15" stroke="white" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round"/></svg>,
  LexCause: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" fill="white" fillOpacity={F} stroke="white" strokeWidth={S}/><line x1="3" y1="9" x2="21" y2="9" stroke="white" strokeWidth={S}/><line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth={S} strokeLinecap="round"/><line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth={S} strokeLinecap="round"/><circle cx="8" cy="14" r="1" fill="white"/><circle cx="12" cy="14" r="1" fill="white"/><circle cx="16" cy="14" r="1" fill="white"/><circle cx="8" cy="18" r="1" fill="white"/><circle cx="12" cy="18" r="1" fill="white"/></svg>,
  LexPredict: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><polyline points="3 17 7 12 11 14 15 8 21 11" stroke="white" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round"/><path d="M3 17h18" stroke="white" strokeWidth={S} strokeLinecap="round" opacity={0.4}/><circle cx="7" cy="12" r="2" fill="white" fillOpacity={0.2} stroke="white" strokeWidth={1}/><circle cx="15" cy="8" r="2" fill="white" fillOpacity={0.2} stroke="white" strokeWidth={1}/></svg>,
  LexBench: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="7" r="4" fill="white" fillOpacity={F} stroke="white" strokeWidth={S}/><path d="M4 21v-1a8 8 0 0116 0v1" fill="white" fillOpacity={F} stroke="white" strokeWidth={S} strokeLinecap="round"/></svg>,
  LexPlain: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="white" fillOpacity={F} stroke="white" strokeWidth={S}/><circle cx="12" cy="8" r="1" fill="white"/><line x1="12" y1="11" x2="12" y2="16" stroke="white" strokeWidth={S} strokeLinecap="round"/></svg>,
  LexDebate: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 11a9 9 0 01-9 9" stroke="white" strokeWidth={S} strokeLinecap="round"/><path d="M3 13a9 9 0 019-9" stroke="white" strokeWidth={S} strokeLinecap="round"/><polyline points="18 8 21 11 18 14" stroke="white" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round"/><polyline points="6 16 3 13 6 10" stroke="white" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round"/></svg>,
  LexConstitute: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7v5c0 5 4 9 9 10 5-1 9-5 9-10V7l-9-5z" fill="white" fillOpacity={F} stroke="white" strokeWidth={S} strokeLinejoin="round"/><polyline points="9 12 11 14 15 10" stroke="white" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round"/></svg>,
  LexGlobe: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="white" fillOpacity={F} stroke="white" strokeWidth={S}/><path d="M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9" stroke="white" strokeWidth={S} strokeLinecap="round"/><path d="M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9" stroke="white" strokeWidth={S} strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="white" strokeWidth={S} strokeLinecap="round"/><line x1="4" y1="8" x2="20" y2="8" stroke="white" strokeWidth={S} strokeLinecap="round" opacity={0.4}/><line x1="4" y1="16" x2="20" y2="16" stroke="white" strokeWidth={S} strokeLinecap="round" opacity={0.4}/></svg>,
  LexPulse: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><polyline points="2 12 6 12 8 5 11 19 14 9 16 15 18 12 22 12" stroke="white" strokeWidth={S} strokeLinecap="round" strokeLinejoin="round"/></svg>,
  LexMap: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.5 2 6 4.5 6 7.5 6 12 12 20 12 20s6-8 6-12.5C18 4.5 15.5 2 12 2z" fill="white" fillOpacity={F} stroke="white" strokeWidth={S} strokeLinejoin="round"/><circle cx="12" cy="7.5" r="2" fill="white" fillOpacity={0.4} stroke="white" strokeWidth={1}/></svg>,
  LexVoice: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="11" rx="3" fill="white" fillOpacity={F} stroke="white" strokeWidth={S}/><path d="M5 11a7 7 0 0014 0" stroke="white" strokeWidth={S} strokeLinecap="round"/><line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth={S} strokeLinecap="round"/><line x1="9" y1="22" x2="15" y2="22" stroke="white" strokeWidth={S} strokeLinecap="round"/></svg>,
}

const iconsLight: Record<string, React.ReactNode> = Object.fromEntries(
  Object.entries(icons).map(([key, icon]) => [
    key, <span key={key} style={{ filter:'invert(1) opacity(0.85)' }}>{icon}</span>
  ])
)

const MODULE_PATHS: Record<string, string> = {
  LexSearch: '/research',
  LexChat: '/assistant',
  LexDraft: '/drafts',
  LexScan: '/scan',
}

const modules = [
  { name: 'LexSearch',     desc: '27 crore cases' },
  { name: 'LexChat',       desc: 'AI legal advisor' },
  { name: 'LexDraft',      desc: '56 document types' },
  { name: 'LexVault',      desc: 'File storage' },
  { name: 'LexScan',       desc: 'Document analysis' },
  { name: 'LexTrack',      desc: 'Live case updates' },
  { name: 'LexCause',      desc: 'Daily cause list' },
  { name: 'LexPredict',    desc: 'Outcome predictor' },
  { name: 'LexBench',      desc: 'Judge analysis' },
  { name: 'LexPlain',      desc: 'Law explainer' },
  { name: 'LexDebate',     desc: 'Counter arguments' },
  { name: 'LexConstitute', desc: 'Constitutional law' },
  { name: 'LexGlobe',      desc: 'International law' },
  { name: 'LexPulse',      desc: 'Legal news' },
  { name: 'LexMap',        desc: 'Court locator' },
  { name: 'LexVoice',      desc: 'Regional languages' },
]

export default function Home() {
  const [winW, setWinW] = useState(1200)
  useEffect(() => { setWinW(window.innerWidth); const h = () => setWinW(window.innerWidth); window.addEventListener('resize',h); return () => window.removeEventListener('resize',h) }, [])
  const { user } = useAuth()
  const [navOpen, setNavOpen] = useState(false)
  const [intro, setIntro] = useState(true)
  const [page, setPage] = useState(false)
  const [dark, setDark] = useState(true)

  const handleDone = () => {
    setPage(true)
    setTimeout(() => setIntro(false), 700)
  }

  const bg          = dark ? '#080809'                : '#F8F8F6'
  const bgSurface   = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)'
  const bgHover     = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
  const border      = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const borderHover = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)'
  const textPrimary = dark ? '#ffffff'                : '#0a0a0b'
  const textMuted   = dark ? 'rgba(255,255,255,0.4)'  : 'rgba(0,0,0,0.55)'
  const textDim     = dark ? 'rgba(255,255,255,0.2)'  : 'rgba(0,0,0,0.4)'
  const navBg       = dark ? 'rgba(8,8,9,0.85)'       : 'rgba(248,248,246,0.85)'
  const btnBg       = dark ? '#ffffff'                : '#0a0a0b'
  const btnText     = dark ? '#000000'                : '#ffffff'
  const logoColor   = dark ? '#ffffff'                : '#0a0a0b'
  const pillBorder  = dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.12)'
  const toggleBg    = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const toggleColor = dark ? 'rgba(255,255,255,0.6)'  : 'rgba(0,0,0,0.6)'
  const moduleIcons = dark ? icons : iconsLight
  const heroGradient = dark
    ? 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.4) 100%)'
    : 'linear-gradient(180deg, #0a0a0b 0%, rgba(10,10,11,0.75) 100%)'

  return (
    <>
      {intro && <AnimatedIntro onDone={handleDone} />}

      <main style={{
        opacity: page ? 1 : 0,
        transform: page ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease, background 0.4s ease',
        minHeight: '100vh',
        background: bg,
        color: textPrimary,
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
      }}>

        <ParticleField dark={dark} />

        <div style={{ position:'relative', zIndex:1 }}>

          {/* NAVBAR */}
          <nav style={{
            borderBottom: `1px solid ${border}`,
            padding: winW < 640 ? '14px 16px' : '14px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backdropFilter: 'blur(12px)',
            background: navBg,
            position: 'sticky', top: 0, zIndex: 10,
            transition: 'background 0.4s ease, border-color 0.4s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <LogoMark size={32} color={logoColor} />
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: textPrimary, letterSpacing: 4, transition:'color 0.3s' }}>LEX</span>
                <span style={{ fontSize: 15, fontWeight: 200, color: textPrimary, letterSpacing: 4, transition:'color 0.3s' }}>INDIA</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13, color: textMuted }}>
              {winW >= 640 && <><a href='/research' style={{ color: 'inherit', textDecoration: 'none' }}>Research</a><a href='/assistant' style={{ color: 'inherit', textDecoration: 'none' }}>Assistant</a><a href='/drafts' style={{ color: 'inherit', textDecoration: 'none' }}>Drafts</a></>}
              <button onClick={() => setDark(d => !d)} style={{
                background: toggleBg, border: `1px solid ${border}`,
                borderRadius: 20, padding: '6px 14px', cursor: 'pointer',
                fontSize: 12, color: toggleColor, fontFamily: 'inherit',
                transition: 'all 0.3s', letterSpacing: 1,
              }}>
                {dark ? '○ Light' : '● Dark'}
              </button>
              {user ? <UserMenu /> : (
                <button
                  onClick={() => window.location.href = '/login'}
                  style={{
                    background: btnBg, color: btnText, border: 'none',
                    padding: '8px 20px', borderRadius: 20, fontSize: 13,
                    fontWeight: 700, cursor: 'pointer', letterSpacing: 1,
                    transition: 'background 0.3s, color 0.3s',
                  }}>
                  Sign In
                </button>
              )}
            </div>
          </nav>

          {/* HERO */}
          <section style={{ maxWidth: 720, margin: '0 auto', padding: '96px 24px 72px', textAlign: 'center' }}>
            <style>{`
              @keyframes floatPill { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
              @keyframes modIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
            `}</style>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: `1px solid ${pillBorder}`, borderRadius: 20,
              padding: '5px 16px', fontSize: 12, color: textMuted,
              marginBottom: 40, letterSpacing: 1,
              animation: 'floatPill 3s ease-in-out infinite',
            }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#3fb950', display:'inline-block', boxShadow:'0 0 6px #3fb950' }}/>
              14 modules live — lexindia.streamlit.app
            </div>

            <h1 style={{
              fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 800,
              lineHeight: 1.08, letterSpacing: -2, marginBottom: 24,
              backgroundImage: heroGradient,
              WebkitBackgroundClip: 'text' as const,
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text' as const,
              display: 'block',
            }}>
              AI Legal Research<br />for Indian<br />Advocates.
            </h1>

            <p style={{ fontSize: 17, color: textMuted, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 44px', transition:'color 0.3s' }}>
              Research. Drafting. Case tracking. File storage.<br />
              AI assistance. All in one matter-centric workspace.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => window.location.href = '/research'}
                style={{
                  background: btnBg, color: btnText, border: 'none',
                  padding: '13px 28px', borderRadius: 24, fontSize: 14,
                  fontWeight: 700, cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.3s, color 0.3s',
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget as HTMLButtonElement
                  b.style.transform = 'scale(1.05)'
                  b.style.boxShadow = dark ? '0 8px 24px rgba(255,255,255,0.15)' : '0 8px 24px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget as HTMLButtonElement
                  b.style.transform = 'scale(1)'
                  b.style.boxShadow = 'none'
                }}
              >
                Try LexIndia Free
              </button>
              <button
                onClick={() => window.open('https://github.com/dpksaxena21/LexIndia-SDE', '_blank')}
                style={{
                  background: 'transparent', color: textMuted,
                  border: `1px solid ${pillBorder}`,
                  padding: '13px 28px', borderRadius: 24, fontSize: 14,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget as HTMLButtonElement
                  b.style.borderColor = borderHover
                  b.style.color = textPrimary
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget as HTMLButtonElement
                  b.style.borderColor = pillBorder
                  b.style.color = textMuted
                }}
              >
                View on GitHub →
              </button>
            </div>
          </section>

          <Marquee dark={dark} />

          {/* STATS */}
          <section style={{ maxWidth: 640, margin: '64px auto', padding: '0 24px' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: winW < 640 ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
              border: `1px solid ${border}`, borderRadius: 16,
              background: bgSurface, backdropFilter: 'blur(8px)',
              transition: 'background 0.3s, border-color 0.3s',
            }}>
              {[
                { target: 27, suffix: 'Cr+', l: 'Judgments' },
                { target: 14, suffix: '',    l: 'Live Modules' },
                { target: 4,  suffix: '',    l: 'APIs' },
                { target: 56, suffix: '',    l: 'Doc Types' },
              ].map((s, i) => (
                <StatCard
                  key={i} index={i}
                  target={s.target} suffix={s.suffix} label={s.l}
                  textPrimary={textPrimary} textDim={textDim} border={border}
                />
              ))}
            </div>
          </section>

          <Marquee dark={dark} />

          {/* MODULES */}
          <section style={{ maxWidth: 960, margin: '64px auto', padding: '0 24px' }}>
            <p style={{ textAlign: 'center', fontSize: 10, letterSpacing: 4, color: textDim, textTransform: 'uppercase', marginBottom: 32, transition:'color 0.3s' }}>
              16 Modules
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: winW < 640 ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 8 }}>
              {modules.map((m, idx) => (
                <div key={m.name}
                  onClick={() => { const p = MODULE_PATHS[m.name]; if (p) window.location.href = p }}
                  style={{
                    background: bgSurface, border: `1px solid ${border}`,
                    borderRadius: 10, padding: '18px', cursor: 'pointer',
                    transition: 'all 0.2s',
                    animation: `modIn 0.4s ease ${idx * 0.04}s both`,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.background = bgHover
                    el.style.borderColor = borderHover
                    el.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.background = bgSurface
                    el.style.borderColor = border
                    el.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ marginBottom: 12 }}>{moduleIcons[m.name]}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: textPrimary, marginBottom: 3, transition:'color 0.3s' }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: textMuted, transition:'color 0.3s' }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <Marquee dark={dark} />

          {/* FOOTER */}
          <footer style={{
            borderTop: `1px solid ${border}`,
            padding: winW < 640 ? '20px 16px' : '28px 40px',
            display: 'flex', alignItems: 'center',
            justifyContent: winW < 640 ? 'center' : 'space-between',
            flexDirection: winW < 640 ? 'column' : 'row',
            gap: winW < 640 ? 12 : 0,
            transition: 'border-color 0.3s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <LogoMark size={20} color={logoColor} />
              <span style={{ fontSize: 12, color: textDim, letterSpacing: 2, transition:'color 0.3s' }}>LEXINDIA</span>
            </div>
            {winW >= 640 && <span style={{ fontSize: 11, color: textDim, letterSpacing: 1, transition:'color 0.3s' }}>
              LAW · TECHNOLOGY · INTELLIGENCE · TRUST · INDIA
            </span>}
            <span style={{ fontSize: 11, color: textDim, transition:'color 0.3s' }}>
              Built by Deepak Saxena
            </span>
          </footer>

        </div>
      </main>
    </>
  )
}