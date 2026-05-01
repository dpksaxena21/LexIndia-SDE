'use client'
import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const API = 'https://lexindia-backend-production.up.railway.app'

type Tab = 'overview' | 'searches' | 'drafts' | 'chats' | 'vault' | 'usage' | 'settings'

const Ico = ({ d, rect, circle, poly, line, size = 20 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {d && <path d={d} />}
    {rect && rect.map((r: any, i: number) => <rect key={i} {...r} />)}
    {circle && <circle {...circle} />}
    {poly && <polyline points={poly} />}
    {line && line.map((l: any, i: number) => <line key={i} {...l} />)}
  </svg>
)

const tabIcons: Record<string, React.ReactNode> = {
  overview: <Ico rect={[{x:3,y:3,width:7,height:7,rx:1},{x:14,y:3,width:7,height:7,rx:1},{x:3,y:14,width:7,height:7,rx:1},{x:14,y:14,width:7,height:7,rx:1}]} />,
  searches: <Ico circle={{cx:11,cy:11,r:8}} d="m21 21-4.35-4.35" />,
  drafts: <Ico d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" poly="14,2 14,8 20,8" line={[{x1:16,y1:13,x2:8,y2:13},{x1:16,y1:17,x2:8,y2:17}]} />,
  chats: <Ico d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  vault: <Ico d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  usage: <Ico line={[{x1:18,y1:20,x2:18,y2:10},{x1:12,y1:20,x2:12,y2:4},{x1:6,y1:20,x2:6,y2:14}]} />,
  settings: <Ico circle={{cx:12,cy:12,r:3}} d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />,
}

function DashboardContent() {
  const { user, token, logout, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'overview')
  const [searches, setSearches] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [vault, setVault] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [width, setWidth] = useState(1200)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [vaultFilter, setVaultFilter] = useState('all')

  useEffect(() => {
    setWidth(window.innerWidth)
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!token) return
    setDataLoading(true)
    Promise.all([
      fetch(`${API}/api/searches`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ searches: [] })),
      fetch(`${API}/api/documents`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ documents: [] })),
      fetch(`${API}/api/chat/sessions`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ sessions: [] })),
      fetch(`${API}/api/vault`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).catch(() => ({ items: [] })),
    ]).then(([s, d, c, v]) => {
      setSearches(s.searches || [])
      setDocuments(d.documents || [])
      setSessions(c.sessions || [])
      setVault(v.items || [])
      setDataLoading(false)
    })
  }, [token])

  if (loading || !user) return null

  const isMobile = width < 768
  const isSmall = width < 640

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'searches', label: 'Search History' },
    { id: 'drafts', label: 'Saved Drafts' },
    { id: 'chats', label: 'Chat History' },
    { id: 'vault', label: 'LexVault' },
    { id: 'usage', label: 'Usage & Plan' },
    { id: 'settings', label: 'Settings' },
  ]

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const deleteVaultItem = async (id: string) => {
    try {
      await fetch(`${API}/api/vault/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      setVault(prev => prev.filter(v => v.id !== id))
    } catch {}
  }

  const vaultFilters = [
    { id: 'all', label: 'All', count: vault.length },
    { id: 'file', label: 'Files', count: vault.filter((v: any) => v.source === 'file').length },
    { id: 'LexSearch', label: 'Research', count: vault.filter((v: any) => v.source === 'LexSearch').length },
    { id: 'LexChat', label: 'Chats', count: vault.filter((v: any) => v.source === 'LexChat' || v.source === 'chat').length },
  ]

  const filteredVault = vaultFilter === 'all' ? vault : vault.filter((v: any) => {
    if (vaultFilter === 'LexChat') return v.source === 'LexChat' || v.source === 'chat'
    return v.source === vaultFilter
  })

  return (
    <div style={{ background: '#0A0A0B', color: '#F4F1EA', minHeight: '100vh', fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vaultFadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes vaultPulse { 0%,100% { opacity:0.3; } 50% { opacity:0.7; } }
        .dash-card { transition: border-color 0.2s, transform 0.15s; }
        .dash-card:hover { border-color: #3a3a3e !important; transform: translateY(-1px); }
        .dash-tab:hover { background: #1a1a1e !important; color: #F4F1EA !important; }
        .vault-item { animation: vaultFadeUp 0.2s ease both; }
        .vault-filter-btn { transition: all 0.15s ease; }
        .vault-filter-btn:hover { color: #F4F1EA !important; border-color: #3a3a3e !important; }
        .vault-action-btn { transition: all 0.15s ease; }
        .vault-action-btn:hover { background: rgba(199,165,106,0.08) !important; color: #C7A56A !important; }
        .vault-delete-btn { transition: all 0.15s ease; }
        .vault-delete-btn:hover { background: rgba(239,68,68,0.08) !important; color: #ef4444 !important; }
      `}</style>

      <nav style={{ borderBottom: '1px solid #1e1e22', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', position: 'sticky', top: 0, background: '#0A0A0B', zIndex: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
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
          <span style={{ color: '#F4F1EA', fontWeight: 700, fontSize: '16px', letterSpacing: '-0.3px' }}>LexIndia</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!isMobile && <span style={{ color: '#F4F1EA', fontSize: '14px', fontWeight: 500 }}>{user.name}</span>}
          {isMobile ? (
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'transparent', border: '1px solid #2a2a2e', borderRadius: '8px', padding: '6px 10px', color: '#8B8B8B', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          ) : (
            <button onClick={() => { logout(); router.push('/') }} style={{ background: 'transparent', border: '1px solid #2a2a2e', borderRadius: '8px', padding: '6px 14px', color: '#8B8B8B', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Sign out</button>
          )}
        </div>
      </nav>

      {isMobile && mobileMenuOpen && (
        <div style={{ background: '#111113', borderBottom: '1px solid #1e1e22', padding: '8px 16px 16px' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMobileMenuOpen(false) }} style={{ width: '100%', padding: '10px 12px', marginBottom: '2px', background: tab === t.id ? '#1a1a1e' : 'transparent', border: 'none', borderRadius: '8px', color: tab === t.id ? '#F4F1EA' : '#6B6B6B', fontSize: '14px', fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'flex', opacity: 0.7 }}>{tabIcons[t.id]}</span>{t.label}
            </button>
          ))}
          <div style={{ height: '1px', background: '#1e1e22', margin: '8px 0' }} />
          <button onClick={() => { logout(); router.push('/') }} style={{ width: '100%', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '8px', color: '#ef4444', fontSize: '14px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>Sign out</button>
        </div>
      )}

      <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 24px', gap: '32px', flexDirection: isMobile ? 'column' : 'row' }}>
        {!isMobile && (
          <div style={{ width: '220px', flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: '88px' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className="dash-tab" style={{ width: '100%', padding: '10px 14px', marginBottom: '4px', background: tab === t.id ? '#1a1a1e' : 'transparent', border: 'none', borderRadius: '8px', color: tab === t.id ? '#F4F1EA' : '#6B6B6B', fontSize: '13px', fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.15s' }}>
                  <span style={{ display: 'flex', opacity: tab === t.id ? 0.9 : 0.5 }}>{tabIcons[t.id]}</span>{t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0, animation: 'fadeUp 0.3s ease' }}>

          {tab === 'overview' && (
            <div>
              <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px' }}>Welcome back, {user.name.split(' ')[0]}</h1>
              <p style={{ color: '#6B6B6B', fontSize: '14px', marginBottom: '24px' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                  { label: 'Searches', value: searches.length, icon: tabIcons.searches, href: '/research' },
                  { label: 'Drafts', value: documents.length, icon: tabIcons.drafts, href: '/drafts' },
                  { label: 'Conversations', value: sessions.length, icon: tabIcons.chats, href: '/assistant' },
                  { label: 'Vault Items', value: vault.length, icon: tabIcons.vault, href: '#' },
                ].map(stat => (
                  <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>
                    <div className="dash-card" style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: '12px', padding: '18px' }}>
                      <div style={{ marginBottom: '8px', opacity: 0.8 }}>{stat.icon}</div>
                      <div style={{ fontSize: '26px', fontWeight: 700, color: '#F4F1EA' }}>{dataLoading ? '—' : stat.value}</div>
                      <div style={{ fontSize: '13px', color: '#6B6B6B', marginTop: '4px' }}>{stat.label}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <h2 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#8B8B8B', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Quick Actions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr' : 'repeat(3, 1fr)', gap: '10px', marginBottom: '28px' }}>
                {[
                  { label: 'New Search', desc: 'Search Indian Kanoon', href: '/research', color: '#3b82f6' },
                  { label: 'New Draft', desc: 'Generate legal document', href: '/drafts', color: '#10b981' },
                  { label: 'Ask LexChat', desc: 'AI legal assistant', href: '/assistant', color: '#8b5cf6' },
                ].map(action => (
                  <Link key={action.label} href={action.href} style={{ textDecoration: 'none' }}>
                    <div className="dash-card" style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: action.color, marginBottom: '10px' }} />
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#F4F1EA', marginBottom: '4px' }}>{action.label}</div>
                      <div style={{ fontSize: '12px', color: '#6B6B6B' }}>{action.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <h2 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: '#8B8B8B', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Recent Activity</h2>
              {dataLoading ? <div style={{ color: '#6B6B6B', fontSize: '14px' }}>Loading...</div> :
               searches.length === 0 && documents.length === 0 ? (
                <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: '12px', padding: '28px', textAlign: 'center', color: '#6B6B6B', fontSize: '14px' }}>No activity yet. Start by running a search or creating a draft.</div>
               ) : (
                <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: '12px', overflow: 'hidden' }}>
                  {[...searches.slice(0, 3).map(s => ({ type: 'search', text: s.query, date: s.created_at })),
                    ...documents.slice(0, 3).map(d => ({ type: 'draft', text: d.title, date: d.created_at })),
                  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((item, i) => (
                    <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid #1a1a1e', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ display: 'flex', opacity: 0.5 }}>{item.type === 'search' ? tabIcons.searches : tabIcons.drafts}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', color: '#F4F1EA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.text}</div>
                        <div style={{ fontSize: '12px', color: '#6B6B6B', marginTop: '2px' }}>{item.type === 'search' ? 'Search' : 'Draft'} · {formatDate(item.date)}</div>
                      </div>
                    </div>
                  ))}
                </div>
               )}
            </div>
          )}

          {tab === 'searches' && (
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>Search History</h1>
              {dataLoading ? <div style={{ color: '#6B6B6B' }}>Loading...</div> :
               searches.length === 0 ? <div style={{ color: '#6B6B6B', fontSize: '14px' }}>No searches yet.</div> :
               searches.map((s, i) => (
                <div key={i} className="dash-card" style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: '10px', padding: '16px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '14px', color: '#F4F1EA', fontWeight: 500 }}>{s.query}</div>
                  <div style={{ fontSize: '12px', color: '#6B6B6B', marginTop: '4px' }}>{s.module} · {formatDate(s.created_at)}</div>
                </div>
               ))}
            </div>
          )}

          {tab === 'drafts' && (
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>Saved Drafts</h1>
              {dataLoading ? <div style={{ color: '#6B6B6B' }}>Loading...</div> :
               documents.length === 0 ? <div style={{ color: '#6B6B6B', fontSize: '14px' }}>No saved drafts yet. Go to <Link href="/drafts" style={{ color: '#F4F1EA' }}>LexDraft</Link> to generate documents.</div> :
               documents.map((d, i) => (
                <div key={i} className="dash-card" style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: '10px', padding: '16px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '14px', color: '#F4F1EA', fontWeight: 500 }}>{d.title}</div>
                  <div style={{ fontSize: '12px', color: '#6B6B6B', marginTop: '4px' }}>{d.doc_type} · {formatDate(d.created_at)}</div>
                </div>
               ))}
            </div>
          )}

          {tab === 'chats' && (
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>Chat History</h1>
              {dataLoading ? <div style={{ color: '#6B6B6B' }}>Loading...</div> :
               sessions.length === 0 ? <div style={{ color: '#6B6B6B', fontSize: '14px' }}>No conversations yet.</div> :
               sessions.map((s: any, i: number) => (
                <div key={i} className="dash-card" style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: '10px', padding: '16px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '14px', color: '#F4F1EA', fontWeight: 500 }}>{s.title}</div>
                  <div style={{ fontSize: '12px', color: '#6B6B6B', marginTop: '4px' }}>Last updated · {formatDate(s.updated_at)}</div>
                </div>
               ))}
            </div>
          )}

          {tab === 'vault' && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px', flexWrap:'wrap', gap:'12px' }}>
                <h1 style={{ fontSize:'22px', fontWeight:700 }}>LexVault</h1>
                <label style={{ cursor:'pointer' }}>
                  <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" style={{ display:'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const t = localStorage.getItem('lex_token')
                      const formData = new FormData()
                      formData.append('file', file)
                      formData.append('title', file.name)
                      try {
                        const res = await fetch(`${API}/api/vault/upload`, { method:'POST', headers:{ Authorization:`Bearer ${t}` }, body: formData })
                        const data = await res.json()
                        if (data.ok) {
                          setVault(prev => [{ id:data.id, title:file.name, source:'file', created_at:new Date().toISOString() }, ...prev])
                        } else {
                          alert('Upload failed: ' + (data.detail || 'Unknown error'))
                        }
                      } catch { alert('Upload failed') }
                      e.target.value = ''
                    }}
                  />
                  <span style={{ background:'rgba(199,165,106,0.12)', color:'#C7A56A', border:'1px solid rgba(199,165,106,0.3)', borderRadius:'8px', padding:'7px 16px', fontSize:'13px', fontWeight:600, display:'inline-flex', alignItems:'center', gap:'6px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload File
                  </span>
                </label>
              </div>

              <p style={{ color:'#6B6B6B', fontSize:'13px', marginBottom:'20px' }}>
                {vault.length} item{vault.length !== 1 ? 's' : ''} · research, chats and uploaded files
              </p>

              <div style={{ display:'flex', gap:'6px', marginBottom:'20px', flexWrap:'wrap' }}>
                {vaultFilters.map(f => (
                  <button key={f.id} onClick={() => setVaultFilter(f.id)} className="vault-filter-btn" style={{
                    padding:'5px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:500,
                    cursor:'pointer', fontFamily:'inherit', border:'1px solid',
                    background: vaultFilter === f.id ? 'rgba(199,165,106,0.15)' : 'transparent',
                    borderColor: vaultFilter === f.id ? 'rgba(199,165,106,0.4)' : '#2a2a2e',
                    color: vaultFilter === f.id ? '#C7A56A' : '#6B6B6B',
                  }}>
                    {f.label}{f.count > 0 ? <span style={{ opacity:0.6 }}> · {f.count}</span> : ''}
                  </button>
                ))}
              </div>

              {dataLoading ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ background:'#111113', border:'1px solid #1e1e22', borderRadius:'10px', padding:'16px', animation:'vaultPulse 1.5s ease infinite', animationDelay:`${i*0.15}s` }}>
                      <div style={{ height:'13px', width:'55%', background:'#1e1e22', borderRadius:'4px', marginBottom:'8px' }}/>
                      <div style={{ height:'10px', width:'25%', background:'#1a1a1e', borderRadius:'4px' }}/>
                    </div>
                  ))}
                </div>
              ) : filteredVault.length === 0 ? (
                <div style={{ background:'#111113', border:'1px solid #1e1e22', borderRadius:'12px', padding:'40px', textAlign:'center' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>
                    {vaultFilter === 'file' ? '📁' : vaultFilter === 'LexSearch' ? '🔍' : vaultFilter === 'LexChat' ? '💬' : '🗄️'}
                  </div>
                  <div style={{ color:'#6B6B6B', fontSize:'14px' }}>
                    {vaultFilter === 'all'
                      ? 'Nothing saved yet. Use "Save to Vault" in Research or Chat pages, or upload a file.'
                      : `No ${vaultFilters.find(f => f.id === vaultFilter)?.label.toLowerCase()} saved yet.`}
                  </div>
                </div>
              ) : (
                <div>
                  {filteredVault.map((v: any, i: number) => (
                    <div key={v.id} className="vault-item dash-card" style={{ background:'#111113', border:'1px solid #1e1e22', borderRadius:'10px', padding:'14px 16px', marginBottom:'8px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', animationDelay:`${i * 0.04}s` }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px', flex:1, minWidth:0 }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'8px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: v.source === 'file' ? 'rgba(99,102,241,0.1)' : v.source === 'LexSearch' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)' }}>
                          {v.source === 'file' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v.title?.endsWith('.pdf') ? '#f87171' : '#818cf8'} strokeWidth="1.5" strokeLinecap="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                            </svg>
                          ) : v.source === 'LexSearch' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round">
                              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                          )}
                        </div>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:'13px', color:'#F4F1EA', fontWeight:500, marginBottom:'3px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{v.title}</div>
                          <div style={{ fontSize:'11px', color:'#6B6B6B', display:'flex', alignItems:'center', gap:'6px' }}>
                            <span style={{ padding:'1px 6px', borderRadius:'3px', fontSize:'10px', fontWeight:500, background: v.source === 'file' ? 'rgba(99,102,241,0.1)' : v.source === 'LexSearch' ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)', color: v.source === 'file' ? '#818cf8' : v.source === 'LexSearch' ? '#60a5fa' : '#a78bfa' }}>
                              {v.source === 'file' ? 'File' : v.source}
                            </span>
                            {formatDate(v.created_at)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'2px', alignItems:'center', flexShrink:0 }}>
                        {v.source === 'file' && (
                          <button className="vault-action-btn" onClick={async () => {
                            const t = localStorage.getItem('lex_token')
                            const res = await fetch(`${API}/api/vault/file/${v.id}`, { headers:{ Authorization:`Bearer ${t}` } })
                            const data = await res.json()
                            if (data.url) window.open(data.url, '_blank')
                          }} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#4a4a4a', padding:'7px', borderRadius:'6px' }} title="Download">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                          </button>
                        )}
                        <button className="vault-delete-btn" onClick={() => deleteVaultItem(v.id)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#4a4a4a', padding:'7px', borderRadius:'6px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1V6"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'usage' && (
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>Usage & Plan</h1>
              <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#F4F1EA' }}>Free Plan</div>
                    <div style={{ fontSize: '13px', color: '#6B6B6B', marginTop: '4px' }}>Basic access to LexIndia</div>
                  </div>
                  <div style={{ padding: '8px 20px', background: 'linear-gradient(135deg, rgba(199,165,106,0.15), rgba(199,165,106,0.05))', border: '1px solid rgba(199,165,106,0.3)', borderRadius: '8px', color: '#C7A56A', fontWeight: 700, fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Upgrade to Pro
                  </div>
                </div>
                {[
                  { label: 'Searches this month', used: searches.length, limit: 20 },
                  { label: 'Drafts generated', used: documents.length, limit: 10 },
                  { label: 'Chat conversations', used: sessions.length, limit: 15 },
                  { label: 'Vault items', used: vault.length, limit: 50 },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#8B8B8B' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', color: '#F4F1EA' }}>{item.used} / {item.limit}</span>
                    </div>
                    <div style={{ height: '4px', background: '#1e1e22', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${Math.min((item.used / item.limit) * 100, 100)}%`, background: item.used >= item.limit ? '#ef4444' : '#C7A56A', borderRadius: '2px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>Settings</h1>
              <div style={{ background: '#111113', border: '1px solid #1e1e22', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px', color: '#F4F1EA' }}>Account</h2>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#6B6B6B', marginBottom: '4px' }}>Name</div>
                  <div style={{ fontSize: '14px', color: '#F4F1EA' }}>{user.name}</div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#6B6B6B', marginBottom: '4px' }}>Email</div>
                  <div style={{ fontSize: '14px', color: '#F4F1EA' }}>{user.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6B6B6B', marginBottom: '4px' }}>Plan</div>
                  <div style={{ fontSize: '14px', color: '#F4F1EA', textTransform: 'capitalize' }}>{user.plan}</div>
                </div>
              </div>
              <button onClick={() => { logout(); router.push('/') }} style={{ padding: '10px 20px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Sign out</button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}