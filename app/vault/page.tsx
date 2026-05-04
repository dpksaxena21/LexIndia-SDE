'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
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

type VaultItem = {
  id: string; title: string; source: string; created_at: string
  folder_id: string | null; file_size?: number; file_type?: string; content?: string
}
type Folder = { id: string; name: string; parent_id: string | null; created_at: string }
type ContextMenu = { x: number; y: number; item?: VaultItem; folder?: Folder } | null

function BackButton() {
  const [canGoBack, setCanGoBack] = useState(false)
  useEffect(() => { setCanGoBack(window.history.length > 1) }, [])
  if (!canGoBack) return null
  return (
    <button
      onClick={() => window.history.back()}
      style={{
        display: 'flex', alignItems: 'center', gap: 3,
        background: 'transparent', border: 'none',
        cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
        fontSize: 12, fontFamily: 'inherit',
        padding: '4px 6px', borderRadius: 6, flexShrink: 0,
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Back
    </button>
  )
}

function FileIcon({ source, title, size = 28 }: { source: string; title: string; size?: number }) {
  const s = size
  if (source === 'file') {
    const ext = title.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="1" width="14" height="18" rx="2" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.2"/><path d="M13 1v5h5" stroke="#ef4444" strokeWidth="1.2" strokeLinejoin="round"/><line x1="7" y1="9" x2="13" y2="9" stroke="#ef4444" strokeWidth="1" strokeLinecap="round"/><line x1="7" y1="12" x2="15" y2="12" stroke="#ef4444" strokeWidth="1" strokeLinecap="round"/><line x1="7" y1="15" x2="11" y2="15" stroke="#ef4444" strokeWidth="1" strokeLinecap="round"/></svg>
    if (ext === 'docx' || ext === 'doc') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="1" width="14" height="18" rx="2" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="1.2"/><path d="M13 1v5h5" stroke="#3b82f6" strokeWidth="1.2" strokeLinejoin="round"/><line x1="7" y1="9" x2="15" y2="9" stroke="#3b82f6" strokeWidth="1" strokeLinecap="round"/><line x1="7" y1="12" x2="15" y2="12" stroke="#3b82f6" strokeWidth="1" strokeLinecap="round"/><line x1="7" y1="15" x2="13" y2="15" stroke="#3b82f6" strokeWidth="1" strokeLinecap="round"/></svg>
    if (['jpg','jpeg','png','gif','webp'].includes(ext || '')) return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="18" height="14" rx="2" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" fill="#8b5cf6" fillOpacity="0.5"/><path d="M2 14l5-4 4 3 3-2 6 5" stroke="#8b5cf6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><rect x="3" y="1" width="14" height="18" rx="2" fill="rgba(107,114,128,0.15)" stroke="#6b7280" strokeWidth="1.2"/><path d="M13 1v5h5" stroke="#6b7280" strokeWidth="1.2"/></svg>
  }
  if (source === 'LexSearch') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="10" cy="10" r="7" fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="1.2"/><line x1="15.5" y1="15.5" x2="20" y2="20" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/></svg>
  if (source === 'LexChat' || source === 'LexPlain') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="rgba(16,185,129,0.15)" stroke="#10b981" strokeWidth="1.2" strokeLinejoin="round"/></svg>
  if (source === 'LexScan') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M3 7V4h3" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/><path d="M21 7V4h-3" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/><path d="M3 17v3h3" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/><path d="M21 17v3h-3" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/><rect x="6" y="7" width="12" height="10" rx="1" fill="rgba(245,158,11,0.15)"/><line x1="3" y1="12" x2="21" y2="12" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/></svg>
  if (source === 'LexDraft') return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="rgba(236,72,153,0.15)" stroke="#ec4899" strokeWidth="1.2" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="#ec4899" strokeWidth="1.2" fill="none"/></svg>
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(107,114,128,0.15)" stroke="#6b7280" strokeWidth="1.2"/></svg>
}

function getSourceLabel(source: string) {
  if (source === 'file') return { label: 'Uploaded', color: '#6b7280' }
  if (source === 'LexSearch') return { label: 'Research', color: '#6366f1' }
  if (source === 'LexChat') return { label: 'Chat', color: '#10b981' }
  if (source === 'LexPlain') return { label: 'LexPlain', color: '#10b981' }
  if (source === 'LexScan') return { label: 'Scan', color: '#f59e0b' }
  if (source === 'LexDraft') return { label: 'Draft', color: '#ec4899' }
  return { label: 'Note', color: '#6b7280' }
}

function renderMarkdown(text: string) {
  const c1 = '#ffffff'
  const c2 = 'rgba(255,255,255,0.82)'
  const c3 = 'rgba(255,255,255,0.08)'
  const c4 = 'rgba(255,255,255,0.5)'
  const bl = 'rgba(255,255,255,0.3)'
  // Tables
  text = text.replace(/((?:^\|.+\|\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').filter(r => r.trim())
    let html = `<div style="overflow-x:auto;margin:12px 0;"><table style="width:100%;border-collapse:collapse;font-size:12px;">`
    let isFirst = true
    for (const row of rows) {
      if (/^\|[-| :]+\|$/.test(row.trim())) continue
      const cells = row.split('|').filter(c => c.trim())
      if (isFirst) {
        html += `<thead><tr>${cells.map(c => `<th style="padding:7px 10px;text-align:left;border-bottom:2px solid rgba(255,255,255,0.15);color:#fff;font-weight:600;font-size:11px;background:rgba(255,255,255,0.05);">${c.trim()}</th>`).join('')}</tr></thead><tbody>`
        isFirst = false
      } else {
        html += `<tr>${cells.map((c,i) => `<td style="padding:7px 10px;border-bottom:1px solid rgba(255,255,255,0.06);color:${c2};line-height:1.5;vertical-align:top;">${c.trim()}</td>`).join('')}</tr>`
      }
    }
    html += `</tbody></table></div>`
    return html
  })
  return text
    .replace(/^#### (.+)$/gm, `<h4 style="font-size:11px;font-weight:600;color:${c4};margin:12px 0 5px;letter-spacing:0.8px;text-transform:uppercase;">$1</h4>`)
    .replace(/^### (.+)$/gm, `<h3 style="font-size:12px;font-weight:700;color:${c4};margin:16px 0 7px;letter-spacing:0.5px;text-transform:uppercase;">$1</h3>`)
    .replace(/^## (.+)$/gm, `<h2 style="font-size:14px;font-weight:700;color:${c1};margin:18px 0 8px;border-bottom:1px solid ${c3};padding-bottom:5px;">$1</h2>`)
    .replace(/^# (.+)$/gm, `<h1 style="font-size:16px;font-weight:800;color:${c1};margin:0 0 12px;">$1</h1>`)
    .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${c1};font-weight:700;">$1</strong>`)
    .replace(/\*(.+?)\*/g, `<em style="color:${c2};">$1</em>`)
    .replace(/^- (.+)$/gm, `<div style="display:flex;gap:8px;margin:4px 0;"><span style="color:${bl};font-size:9px;margin-top:5px;">&#9658;</span><span style="font-size:13px;color:${c2};line-height:1.6;">$1</span></div>`)
    .replace(/^(\d+)\. (.+)$/gm, `<div style="display:flex;gap:6px;margin:4px 0;"><span style="color:${c4};font-size:12px;min-width:16px;font-weight:600;">$1.</span><span style="font-size:13px;color:${c2};line-height:1.6;">$2</span></div>`)
    .replace(/\n\n/g, `<div style="height:8px"></div>`)
}

function AIAnimation() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '32px 20px' }}>
      <style>{`
        @keyframes aiPulse { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.2);opacity:1} }
        @keyframes aiOrbit { from{transform:rotate(0deg) translateX(24px) rotate(0deg)} to{transform:rotate(360deg) translateX(24px) rotate(-360deg)} }
        @keyframes aiBeam { 0%{opacity:0;transform:scaleY(0)} 50%{opacity:1;transform:scaleY(1)} 100%{opacity:0;transform:scaleY(0)} }
      `}</style>
      <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Core */}
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'radial-gradient(circle, #C7A56A, rgba(199,165,106,0.3))', animation: 'aiPulse 1.5s ease-in-out infinite', boxShadow: '0 0 20px rgba(199,165,106,0.4)' }}/>
        {/* Orbiting dots */}
        {[0,1,2].map(i => (
          <div key={i} style={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: '#C7A56A', animation: `aiOrbit 2s linear ${i * 0.67}s infinite`, opacity: 0.8 }}/>
        ))}
        {/* Beams */}
        {[0,45,90,135].map((deg, i) => (
          <div key={i} style={{ position: 'absolute', width: 1, height: 28, background: 'linear-gradient(to top, transparent, rgba(199,165,106,0.6), transparent)', transform: `rotate(${deg}deg)`, transformOrigin: 'center', animation: `aiBeam 1.5s ease-in-out ${i * 0.2}s infinite` }}/>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(199,165,106,0.8)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600 }}>Analyzing...</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{ width: 3, height: 16, borderRadius: 2, background: '#C7A56A', animation: `aiPulse 0.8s ease-in-out ${i * 0.12}s infinite`, opacity: 0.6 }}/>
        ))}
      </div>
    </div>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatSize(bytes?: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const SOURCE_GROUPS = [
  { key: 'file', label: 'Uploaded Files', color: '#6b7280' },
  { key: 'LexSearch', label: 'Research', color: '#6366f1' },
  { key: 'LexChat', label: 'Chat History', color: '#10b981' },
  { key: 'LexPlain', label: 'LexPlain', color: '#10b981' },
  { key: 'LexScan', label: 'Scan Results', color: '#f59e0b' },
  { key: 'LexDraft', label: 'Drafts', color: '#ec4899' },
]

export default function LexVault() {
  const { token } = useAuth()
  const [items, setItems] = useState<VaultItem[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'My Vault' }])
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<VaultItem[] | null>(null)
  const [searching, setSearching] = useState(false)

  const doSearch = async (q: string) => {
    if (!q.trim() || q.trim().length < 2) { setSearchResults(null); return }
    if (!token) return
    setSearching(true)
    try {
      const res = await fetch(`${API}/api/vault/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setSearchResults(data.results || [])
    } catch { setSearchResults([]) }
    setSearching(false)
  }
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<{ id: string; value: string; type: 'item' | 'folder' } | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [preview, setPreview] = useState<{ item: VaultItem; url?: string } | null>(null)
  const [analysis, setAnalysis] = useState<{ text: string; loading: boolean } | null>(null)
  const [scanning, setScanning] = useState(false)
  const [draggedItem, setDraggedItem] = useState<VaultItem | null>(null)
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
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

  const fetchData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [ir, fr] = await Promise.all([
        fetch(`${API}/api/vault`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/vault/folders`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const id = await ir.json(); const fd = await fr.json()
      setItems(id.items || []); setFolders(fd.folders || [])
    } catch {}
    setLoading(false)
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => {
    const close = () => { setContextMenu(null); setActiveMenuId(null) }
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  const currentFolders = folders.filter(f => f.parent_id === currentFolder)
  const currentItems = items.filter(i => (i.folder_id ?? null) === currentFolder)
  const filteredFolders = currentFolders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
  const filteredItems = currentItems
    .filter(i => i.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title)
      if (sortBy === 'type') return a.source.localeCompare(b.source)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const navigateToFolder = (f: Folder) => { setCurrentFolder(f.id); setBreadcrumb(p => [...p, { id: f.id, name: f.name }]) }
  const navigateBreadcrumb = (i: number) => { const c = breadcrumb[i]; setCurrentFolder(c.id); setBreadcrumb(p => p.slice(0, i + 1)) }

  const createFolder = async () => {
    if (!newFolderName.trim() || !token) return
    try {
      const res = await fetch(`${API}/api/vault/folders`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: newFolderName.trim(), parent_id: currentFolder }) })
      const folder = await res.json()
      setFolders(p => [...p, folder]); setNewFolderName(''); setShowNewFolder(false)
    } catch {}
  }

  const deleteFolder = async (id: string) => {
    if (!token) return
    await fetch(`${API}/api/vault/folders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setFolders(p => p.filter(f => f.id !== id))
  }

  const deleteItem = async (id: string) => {
    if (!token) return
    await fetch(`${API}/api/vault/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setItems(p => p.filter(i => i.id !== id))
    if (preview?.item.id === id) setPreview(null)
  }

  const renameItem = async () => {
    if (!renaming || !token) return
    if (renaming.type === 'item') {
      await fetch(`${API}/api/vault/${renaming.id}/rename`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: renaming.value }) })
      setItems(p => p.map(i => i.id === renaming.id ? { ...i, title: renaming.value } : i))
    } else {
      setFolders(p => p.map(f => f.id === renaming.id ? { ...f, name: renaming.value } : f))
    }
    setRenaming(null)
  }

  const uploadFile = async (file: File) => {
    if (!token) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file); fd.append('title', file.name)
    if (currentFolder) fd.append('folder_id', currentFolder)
    try {
      const res = await fetch(`${API}/api/vault/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
      if (res.ok) await fetchData()
      else { const e = await res.json(); alert(`Upload failed: ${e.detail || 'Unknown error'}`) }
    } catch (e) { alert('Upload failed. Please try again.') }
    setUploading(false)
  }

  const openPreview = async (item: VaultItem) => {
    setAnalysis(null)
    if (item.source === 'file') {
      try {
        const res = await fetch(`${API}/api/vault/file/${item.id}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        setPreview({ item, url: data.url })
      } catch { setPreview({ item }) }
    } else {
      setPreview({ item })
    }
  }

  const analyzeItem = async (item: VaultItem) => {
    if (!token) return
    setAnalysis({ text: '', loading: true })
    try {
      const res = await fetch(`${API}/api/vault/analyze/${item.id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setAnalysis({ text: data.analysis, loading: false })
    } catch { setAnalysis({ text: 'Analysis failed. Please try again.', loading: false }) }
  }

  const scanItem = async (item: VaultItem) => {
    if (!token) return
    setScanning(true)
    setAnalysis({ text: '', loading: true })
    try {
      const res = await fetch(`${API}/api/vault/scan/${item.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.detail) {
        setAnalysis({ text: `Error: ${data.detail}`, loading: false })
      } else {
        setAnalysis({ text: data.analysis, loading: false })
      }
    } catch {
      setAnalysis({ text: 'Scan failed. Please try again.', loading: false })
    }
    setScanning(false)
  }

  const moveItemToFolder = async (itemId: string, folderId: string | null) => {
    if (!token) return
    await fetch(`${API}/api/vault/${itemId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ folder_id: folderId }),
    })
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, folder_id: folderId } : i))
    setDraggedItem(null); setDragOverFolder(null)
  }

  const bg = '#080809'; const sidebarBg = '#060608'
  const surface = 'rgba(255,255,255,0.03)'; const border = 'rgba(255,255,255,0.08)'
  const borderHi = 'rgba(255,255,255,0.18)'; const tp = '#ffffff'
  const tm = 'rgba(255,255,255,0.6)'; const td = 'rgba(255,255,255,0.3)'
  const gold = '#C7A56A'

  // Group items by source for display
  const groupedItems = SOURCE_GROUPS.map(g => ({
    ...g,
    items: filteredItems.filter(i => i.source === g.key)
  })).filter(g => g.items.length > 0)

  const ItemCard = ({ item }: { item: VaultItem }) => {
    const { label, color } = getSourceLabel(item.source)
    const isMenuOpen = activeMenuId === item.id
    return (
      <div className="vault-item" onClick={() => openPreview(item)}
        style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: '14px', cursor: 'grab', transition: 'all 0.15s', position: 'relative', animation: 'fadeIn 0.2s ease' }}
        draggable
        onDragStart={() => setDraggedItem(item)}
        onDragEnd={() => { setDraggedItem(null); setDragOverFolder(null) }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <FileIcon source={item.source} title={item.title} size={28}/>
          <button className="three-dots-btn" onClick={e => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : item.id) }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: td, padding: '2px 4px', borderRadius: 4, opacity: isMenuOpen ? 1 : undefined }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: tm, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{item.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color, fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: 10, color: td }}>{formatDate(item.created_at)}</span>
        </div>
        {/* 3-dots dropdown */}
        {isMenuOpen && (
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 36, right: 8, background: '#111113', border: `1px solid ${border}`, borderRadius: 10, padding: '6px', zIndex: 200, minWidth: 160, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', animation: 'fadeIn 0.15s ease' }}>
            <button className="ctx-item" onClick={() => { openPreview(item); setActiveMenuId(null) }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: tm, fontFamily: 'inherit', fontSize: 12, borderRadius: 6, textAlign: 'left' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Open
            </button>
            <button className="ctx-item" onClick={() => { analyzeItem(item); openPreview(item); setActiveMenuId(null) }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: gold, fontFamily: 'inherit', fontSize: 12, borderRadius: 6, textAlign: 'left' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>AI Analyze
            </button>
            <button className="ctx-item" onClick={() => { setRenaming({ id: item.id, value: item.title, type: 'item' }); setActiveMenuId(null) }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: tm, fontFamily: 'inherit', fontSize: 12, borderRadius: 6, textAlign: 'left' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Rename
            </button>
            {item.source === 'file' && (
              <button className="ctx-item" onClick={async () => { const r = await fetch(`${API}/api/vault/file/${item.id}`, { headers: { Authorization: `Bearer ${token}` } }); const d = await r.json(); window.open(d.url, '_blank'); setActiveMenuId(null) }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: tm, fontFamily: 'inherit', fontSize: 12, borderRadius: 6, textAlign: 'left' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download
              </button>
            )}
            <div style={{ height: 1, background: border, margin: '4px 6px' }}/>
            <button className="ctx-item" onClick={() => { deleteItem(item.id); setActiveMenuId(null) }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontFamily: 'inherit', fontSize: 12, borderRadius: 6, textAlign: 'left' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>Delete
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', background: bg, color: tp, fontFamily: 'system-ui,sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:767px){.bottom-nav-spacer{height:72px}}
        .vault-item:hover{background:rgba(255,255,255,0.06)!important;border-color:rgba(255,255,255,0.12)!important}
        .vault-item:hover .three-dots-btn{opacity:1!important}
        .three-dots-btn{opacity:0;transition:opacity 0.15s}
        .folder-item:hover{background:rgba(255,255,255,0.06)!important}
        .folder-drop{background:rgba(199,165,106,0.15)!important;border-color:rgba(199,165,106,0.5)!important}
        .sidebar-item:hover{background:rgba(255,255,255,0.06)!important}
        .ctx-item:hover{background:rgba(255,255,255,0.08)!important}
        input::placeholder{color:rgba(255,255,255,0.25)}
        select option{background:#111113}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>

      {/* TOP BAR */}
      <div style={{ borderBottom:`1px solid ${border}`, padding:'0 20px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(6,6,8,0.95)', backdropFilter:'blur(12px)', flexShrink:0, zIndex:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <BackButton />
          <button onClick={() => window.location.href='/about'} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer' }}>
            <LogoMark size={20} color={tp}/><span style={{ fontSize:14, fontWeight:700, color:tp }}>LexIndia</span>
          </button>
          <span style={{ color:td }}>·</span>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize:14, fontWeight:600, color:gold }}>LexVault</span>
          </div>
        </div>

        <div style={{ flex:1, maxWidth:400, margin:'0 24px', position:'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={td} strokeWidth="2" strokeLinecap="round" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => { setSearch(e.target.value); if (!e.target.value) setSearchResults(null) }} onKeyDown={e => e.key === 'Enter' && doSearch(search)} placeholder="Search files and folders..." style={{ width:'100%', background:surface, border:`1px solid ${border}`, borderRadius:8, padding:'8px 12px 8px 36px', fontSize:13, color:tp, outline:'none', boxSizing:'border-box' }} onFocus={e => e.target.style.borderColor=borderHi} onBlur={e => e.target.style.borderColor=border}/>
          <button onClick={() => doSearch(search)} disabled={searching || !search.trim()} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background: search.trim() ? gold : 'transparent', border:'none', borderRadius:6, padding:'4px 10px', fontSize:11, color: search.trim() ? '#000' : td, cursor: search.trim() ? 'pointer' : 'default', fontWeight:600, fontFamily:'inherit' }}>
            {searching ? '...' : 'Search'}
          </button>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ display:'flex', background:surface, border:`1px solid ${border}`, borderRadius:8, overflow:'hidden' }}>
            {(['grid','list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding:'6px 10px', background:view===v?'rgba(255,255,255,0.1)':'transparent', border:'none', cursor:'pointer', color:view===v?tp:td, display:'flex', alignItems:'center' }}>
                {v==='grid' ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ background:surface, border:`1px solid ${border}`, borderRadius:8, padding:'6px 10px', fontSize:12, color:tm, outline:'none', cursor:'pointer' }}>
            <option value="date">Date</option><option value="name">Name</option><option value="type">Type</option>
          </select>
          <input ref={fileInputRef} type="file" multiple style={{ display:'none' }} onChange={e => { Array.from(e.target.files||[]).forEach(uploadFile); e.target.value='' }}/>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ padding:'7px 14px', background:'rgba(199,165,106,0.12)', border:'1px solid rgba(199,165,106,0.3)', borderRadius:8, color:gold, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
            {uploading ? <div style={{ width:12, height:12, border:`2px solid ${gold}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        {/* SIDEBAR */}
        {!isMobile && (
          <div style={{ width:220, flexShrink:0, background:sidebarBg, borderRight:`1px solid ${border}`, display:'flex', flexDirection:'column', padding:'12px 8px' }}>
            <button className="sidebar-item" onClick={() => { setCurrentFolder(null); setBreadcrumb([{ id:null, name:'My Vault' }]) }} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, background:currentFolder===null?'rgba(255,255,255,0.08)':'transparent', border:'none', cursor:'pointer', color:tp, fontFamily:'inherit', fontSize:13, width:'100%', textAlign:'left', marginBottom:4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>My Vault
            </button>
            <div style={{ fontSize:10, color:td, letterSpacing:'1px', textTransform:'uppercase', padding:'8px 12px 4px', fontWeight:600 }}>Folders</div>
            {folders.filter(f => f.parent_id===null).map(f => (
              <button key={f.id} className="sidebar-item" onClick={() => navigateToFolder(f)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, background:currentFolder===f.id?'rgba(255,255,255,0.08)':'transparent', border:'none', cursor:'pointer', color:tm, fontFamily:'inherit', fontSize:12, width:'100%', textAlign:'left', marginBottom:2 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span>
              </button>
            ))}
            <button onClick={() => setShowNewFolder(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:8, background:'rgba(199,165,106,0.06)', border:`1px solid rgba(199,165,106,0.15)`, cursor:'pointer', color:gold, fontFamily:'inherit', fontSize:12, marginTop:8, width:'calc(100% - 0px)', textAlign:'left' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Folder
            </button>
            <div style={{ flex:1 }}/>
            <div style={{ padding:'12px', borderTop:`1px solid ${border}`, marginTop:8 }}>
              <div style={{ fontSize:11, color:td, marginBottom:6 }}>Storage</div>
              <div style={{ fontSize:12, color:tm }}>{items.length} files · {folders.length} folders</div>
              <div style={{ marginTop:8, height:3, background:'rgba(255,255,255,0.08)', borderRadius:2 }}>
                <div style={{ width:`${Math.min((items.length/100)*100,100)}%`, height:'100%', background:gold, borderRadius:2 }}/>
              </div>
            </div>
          </div>
        )}

        {/* MAIN */}
        <div style={{ flex:1, overflow:'auto', padding:'20px 24px' }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); Array.from(e.dataTransfer.files).forEach(uploadFile) }}>

          {dragging && <div style={{ position:'fixed', inset:0, background:'rgba(199,165,106,0.08)', border:'2px dashed rgba(199,165,106,0.4)', zIndex:30, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}><div style={{ fontSize:18, color:gold, fontWeight:600 }}>Drop files to upload</div></div>}

          {/* Breadcrumb */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:20 }}>
            {breadcrumb.map((c, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                {i>0 && <span style={{ color:td, fontSize:12 }}>›</span>}
                <button onClick={() => navigateBreadcrumb(i)} style={{ background:'none', border:'none', cursor:i<breadcrumb.length-1?'pointer':'default', color:i===breadcrumb.length-1?tp:td, fontSize:13, fontFamily:'inherit', padding:'2px 4px', borderRadius:4 }}>{c.name}</button>
              </div>
            ))}
          </div>

          {/* New folder input */}
          {showNewFolder && (
            <div style={{ display:'flex', gap:8, marginBottom:16, animation:'fadeIn 0.2s ease' }}>
              <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder name..." autoFocus
                onKeyDown={e => { if(e.key==='Enter') createFolder(); if(e.key==='Escape'){ setShowNewFolder(false); setNewFolderName('') } }}
                style={{ background:surface, border:`1px solid ${borderHi}`, borderRadius:8, padding:'8px 12px', fontSize:13, color:tp, outline:'none', fontFamily:'inherit', width:200 }}/>
              <button onClick={createFolder} style={{ padding:'8px 16px', background:'rgba(199,165,106,0.12)', border:'1px solid rgba(199,165,106,0.3)', borderRadius:8, color:gold, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Create</button>
              <button onClick={() => { setShowNewFolder(false); setNewFolderName('') }} style={{ padding:'8px 12px', background:surface, border:`1px solid ${border}`, borderRadius:8, color:td, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
            </div>
          )}

          {searchResults !== null && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: td, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{search}"
                <button onClick={() => { setSearchResults(null); setSearch('') }} style={{ marginLeft: 12, background: 'transparent', border: 'none', color: td, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', textDecoration: 'underline' }}>Clear</button>
              </div>
              {searchResults.length === 0 ? (
                <div style={{ color: td, fontSize: 13 }}>No results found.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 140 : 160}px, 1fr))`, gap: 8 }}>
                  {searchResults.map((item: any) => <ItemCard key={item.id} item={item}/>)}
                </div>
              )}
            </div>
          )}
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'60px 0', color:td }}>Loading...</div>
          ) : filteredFolders.length===0 && filteredItems.length===0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 0', gap:16 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={td} strokeWidth="1" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div style={{ fontSize:14, color:td }}>{search ? 'No files found' : 'Vault is empty — upload files or save from other modules'}</div>
              <button onClick={() => fileInputRef.current?.click()} style={{ padding:'10px 20px', background:'rgba(199,165,106,0.12)', border:'1px solid rgba(199,165,106,0.3)', borderRadius:8, color:gold, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Upload Files</button>
            </div>
          ) : (
            <div>
              {/* Folders section */}
              {filteredFolders.length > 0 && (
                <div style={{ marginBottom:32 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                    <div style={{ width:3, height:14, borderRadius:2, background:gold }}/>
                    <span style={{ fontSize:11, color:td, letterSpacing:'1px', textTransform:'uppercase', fontWeight:600 }}>Folders</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fill, minmax(${isMobile?140:160}px, 1fr))`, gap:8 }}>
                    {filteredFolders.map(f => (
                      <div key={f.id} className="folder-item" onClick={() => navigateToFolder(f)}
                        style={{ background: dragOverFolder === f.id ? 'rgba(199,165,106,0.12)' : surface, border:`1px solid ${dragOverFolder === f.id ? 'rgba(199,165,106,0.5)' : border}`, borderRadius:10, padding:'16px', cursor:'pointer', transition:'all 0.15s', position:'relative' }}
                      onDragOver={e => { e.preventDefault(); setDragOverFolder(f.id) }}
                      onDragLeave={() => setDragOverFolder(null)}
                      onDrop={e => { e.preventDefault(); if (draggedItem) moveItemToFolder(draggedItem.id, f.id) }}>
                        {renaming?.id===f.id ? (
                          <input value={renaming.value} onChange={e => setRenaming({...renaming, value:e.target.value})} autoFocus onClick={e => e.stopPropagation()}
                            onKeyDown={e => { if(e.key==='Enter') renameItem(); if(e.key==='Escape') setRenaming(null) }}
                            style={{ width:'100%', background:'rgba(255,255,255,0.1)', border:`1px solid ${borderHi}`, borderRadius:4, padding:'2px 6px', fontSize:12, color:tp, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
                        ) : (
                          <>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.2" strokeLinecap="round" style={{ marginBottom:10 }}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" fill="rgba(199,165,106,0.1)"/></svg>
                            <div style={{ fontSize:12, fontWeight:600, color:tm, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</div>
                            <div style={{ fontSize:10, color:td, marginTop:2 }}>{items.filter(i=>i.folder_id===f.id).length} files</div>
                            <button onClick={e => { e.stopPropagation(); setContextMenu({ x:0, y:0, folder:f }) }} style={{ position:'absolute', top:8, right:8, background:'transparent', border:'none', color:td, cursor:'pointer', padding:'2px 4px', borderRadius:4, opacity:0 }} className="three-dots-btn">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grouped file sections */}
              {view === 'grid' ? (
                groupedItems.map(group => (
                  <div key={group.key} style={{ marginBottom:32 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                      <div style={{ width:3, height:14, borderRadius:2, background:group.color }}/>
                      <span style={{ fontSize:11, color:td, letterSpacing:'1px', textTransform:'uppercase', fontWeight:600 }}>{group.label}</span>
                      <span style={{ fontSize:10, color:td }}>({group.items.length})</span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fill, minmax(${isMobile?140:160}px, 1fr))`, gap:8 }}>
                      {group.items.map(item => (
                        renaming?.id===item.id ? (
                          <div key={item.id} style={{ background:surface, border:`1px solid ${borderHi}`, borderRadius:10, padding:'14px' }}>
                            <input value={renaming.value} onChange={e => setRenaming({...renaming, value:e.target.value})} autoFocus
                              onKeyDown={e => { if(e.key==='Enter') renameItem(); if(e.key==='Escape') setRenaming(null) }}
                              style={{ width:'100%', background:'rgba(255,255,255,0.1)', border:`1px solid ${borderHi}`, borderRadius:4, padding:'4px 8px', fontSize:12, color:tp, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
                          </div>
                        ) : <ItemCard key={item.id} item={item}/>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 120px 80px', gap:16, padding:'8px 12px', borderBottom:`1px solid ${border}`, fontSize:11, color:td, letterSpacing:'0.5px', textTransform:'uppercase', fontWeight:600 }}>
                    <span>Name</span><span>Type</span><span>Date</span><span>Size</span>
                  </div>
                  {filteredFolders.map(f => (
                    <div key={f.id} className="folder-item" onClick={() => navigateToFolder(f)} style={{ display:'grid', gridTemplateColumns:'1fr 100px 120px 80px', gap:16, padding:'10px 12px', borderBottom:`1px solid rgba(255,255,255,0.04)`, cursor:'pointer', borderRadius:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                        <span style={{ fontSize:13, color:tm }}>{f.name}</span>
                      </div>
                      <span style={{ fontSize:12, color:td, alignSelf:'center' }}>Folder</span>
                      <span style={{ fontSize:12, color:td, alignSelf:'center' }}>{formatDate(f.created_at)}</span>
                      <span style={{ fontSize:12, color:td, alignSelf:'center' }}>—</span>
                    </div>
                  ))}
                  {filteredItems.map(item => {
                    const { label, color } = getSourceLabel(item.source)
                    return (
                      <div key={item.id} className="vault-item" onClick={() => openPreview(item)} style={{ display:'grid', gridTemplateColumns:'1fr 100px 120px 80px', gap:16, padding:'10px 12px', borderBottom:`1px solid rgba(255,255,255,0.04)`, cursor:'pointer', borderRadius:6, border:'1px solid transparent' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <FileIcon source={item.source} title={item.title} size={18}/>
                          <span style={{ fontSize:13, color:tm, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title}</span>
                        </div>
                        <span style={{ fontSize:11, color, alignSelf:'center', fontWeight:600 }}>{label}</span>
                        <span style={{ fontSize:12, color:td, alignSelf:'center' }}>{formatDate(item.created_at)}</span>
                        <span style={{ fontSize:12, color:td, alignSelf:'center' }}>{formatSize(item.file_size)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
          <div className="bottom-nav-spacer"/>
        </div>
      </div>

      {/* FOLDER CONTEXT MENU */}
      {contextMenu?.folder && (
        <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#111113', border:`1px solid ${border}`, borderRadius:10, padding:'6px', zIndex:200, minWidth:180, boxShadow:'0 8px 32px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
          <button className="ctx-item" onClick={() => { navigateToFolder(contextMenu.folder!); setContextMenu(null) }} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 12px', background:'transparent', border:'none', cursor:'pointer', color:tm, fontFamily:'inherit', fontSize:13, borderRadius:6, textAlign:'left' }}>Open</button>
          <button className="ctx-item" onClick={() => { setRenaming({ id:contextMenu.folder!.id, value:contextMenu.folder!.name, type:'folder' }); setContextMenu(null) }} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 12px', background:'transparent', border:'none', cursor:'pointer', color:tm, fontFamily:'inherit', fontSize:13, borderRadius:6, textAlign:'left' }}>Rename</button>
          <div style={{ height:1, background:border, margin:'4px 8px' }}/>
          <button className="ctx-item" onClick={() => { deleteFolder(contextMenu.folder!.id); setContextMenu(null) }} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 12px', background:'transparent', border:'none', cursor:'pointer', color:'#ef4444', fontFamily:'inherit', fontSize:13, borderRadius:6, textAlign:'left' }}>Delete Folder</button>
          <button onClick={() => setContextMenu(null)} style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', padding:'6px', background:'transparent', border:'none', cursor:'pointer', color:td, fontFamily:'inherit', fontSize:11, marginTop:2 }}>Cancel</button>
        </div>
      )}

      {/* FILE PREVIEW */}
      {preview && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding: fullscreen ? 0 : 24 }} onClick={() => { setPreview(null); setAnalysis(null); setFullscreen(false) }}>
          <div style={{ background:'#0d0d0f', border:`1px solid ${border}`, borderRadius: fullscreen ? 0 : 16, width:'100%', maxWidth: fullscreen ? '100%' : 900, height: fullscreen ? '100%' : '90vh', overflow:'hidden', display:'flex', flexDirection:'column', animation:'fadeIn 0.2s ease' }} onClick={e => e.stopPropagation()}>

            {/* Preview header */}
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <FileIcon source={preview.item.source} title={preview.item.title} size={22}/>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:tp }}>{preview.item.title}</div>
                  <div style={{ fontSize:11, color:td }}>{getSourceLabel(preview.item.source).label} · {formatDate(preview.item.created_at)}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <button onClick={() => { if(!analysis || !analysis.loading) analyzeItem(preview.item) }} style={{ padding:'7px 14px', background:'rgba(199,165,106,0.12)', border:'1px solid rgba(199,165,106,0.3)', borderRadius:8, color:gold, fontSize:12, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  AI Analyze
                </button>
                {preview.item.source === 'file' && preview.url && (
                  <button onClick={() => scanItem(preview.item)} disabled={scanning} style={{ padding:'7px 14px', background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:8, color:'#6366f1', fontSize:12, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"><path d="M3 7V4h3"/><path d="M21 7V4h-3"/><path d="M3 17v3h3"/><path d="M21 17v3h-3"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
                    {scanning ? 'Scanning...' : 'Deep Scan'}
                  </button>
                )}
                {preview.url && (
                  <a href={preview.url} target="_blank" rel="noopener noreferrer" style={{ padding:'7px 12px', background:surface, border:`1px solid ${border}`, borderRadius:8, color:tm, fontSize:12, textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download
                  </a>
                )}
                {preview.url && (
                  <button onClick={() => setFullscreen(f => !f)} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} style={{ padding:'7px 10px', background:surface, border:`1px solid ${border}`, borderRadius:8, color:td, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center' }}>
                    {fullscreen
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v3a2 2 0 01-2 2H3"/><path d="M21 8h-3a2 2 0 01-2-2V3"/><path d="M3 16h3a2 2 0 012 2v3"/><path d="M16 21v-3a2 2 0 012-2h3"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3H5a2 2 0 00-2 2v3"/><path d="M21 8V5a2 2 0 00-2-2h-3"/><path d="M3 16v3a2 2 0 002 2h3"/><path d="M16 21h3a2 2 0 002-2v-3"/></svg>}
                  </button>
                )}
                <button onClick={() => { setPreview(null); setAnalysis(null); setFullscreen(false) }} style={{ padding:'7px 10px', background:surface, border:`1px solid ${border}`, borderRadius:8, color:td, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>✕</button>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex:1, overflow:'hidden', display:'flex', gap:0 }}>
              {/* Doc */}
              <div style={{ flex:1, overflow:'auto', padding: analysis ? 16 : 0 }}>
                {preview.url ? (
                  <iframe src={preview.url} style={{ width:'100%', height:'100%', border:'none', background:'#fff', minHeight:400 }} title={preview.item.title}/>
                ) : (
                  <div style={{ background:surface, borderRadius:10, padding:20, height:'100%', overflow:'auto', margin:16 }}>
                    <pre style={{ fontSize:13, color:tm, lineHeight:1.7, whiteSpace:'pre-wrap', fontFamily:'system-ui', margin:0 }}>{preview.item.content || 'No preview available'}</pre>
                  </div>
                )}
              </div>

              {/* AI Panel */}
              {analysis && (
                <div style={{ width: fullscreen ? '40%' : 320, minWidth:240, maxWidth:'65%', flexShrink:0, borderLeft:`1px solid ${border}`, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
                  <div style={{ padding:'12px 16px', borderBottom:`1px solid ${border}`, display:'flex', alignItems:'center', gap:8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span style={{ fontSize:11, color:gold, letterSpacing:'1px', textTransform:'uppercase', fontWeight:600 }}>AI Analysis</span>
                    <button onClick={() => setAnalysis(null)} style={{ marginLeft:'auto', background:'transparent', border:'none', color:td, cursor:'pointer', fontSize:12, padding:'2px 6px' }}>✕</button>
                  </div>
                  <div style={{ flex:1, overflow:'auto', padding:16 }}>
                    {analysis.loading ? <AIAnimation/> : (
                      <div style={{ fontSize:13, color:tm, lineHeight:1.7 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(analysis.text) }}/>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}