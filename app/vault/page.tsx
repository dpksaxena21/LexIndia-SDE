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
  id: string
  title: string
  source: string
  created_at: string
  folder_id: string | null
  file_size?: number
  file_type?: string
  content?: string
}

type Folder = {
  id: string
  name: string
  parent_id: string | null
  created_at: string
}

type ContextMenu = {
  x: number
  y: number
  item?: VaultItem
  folder?: Folder
} | null

function getFileIcon(source: string, title: string) {
  if (source === 'file') {
    const ext = title.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return { icon: '📄', color: '#ef4444', label: 'PDF' }
    if (ext === 'docx' || ext === 'doc') return { icon: '📝', color: '#3b82f6', label: 'DOC' }
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') return { icon: '🖼️', color: '#8b5cf6', label: 'IMG' }
    return { icon: '📎', color: '#6b7280', label: 'FILE' }
  }
  if (source === 'LexSearch') return { icon: '🔍', color: '#6366f1', label: 'SEARCH' }
  if (source === 'LexChat' || source === 'LexPlain') return { icon: '💬', color: '#10b981', label: 'CHAT' }
  if (source === 'LexScan') return { icon: '📊', color: '#f59e0b', label: 'SCAN' }
  if (source === 'LexDraft') return { icon: '✍️', color: '#ec4899', label: 'DRAFT' }
  return { icon: '📁', color: '#6b7280', label: 'NOTE' }
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

export default function LexVault() {
  const { token, user } = useAuth()
  const [items, setItems] = useState<VaultItem[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [breadcrumb, setBreadcrumb] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'My Vault' }])
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenu>(null)
  const [renaming, setRenaming] = useState<{ id: string; value: string; type: 'item' | 'folder' } | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<{ item: VaultItem; url?: string } | null>(null)
  const [analysis, setAnalysis] = useState<{ text: string; loading: boolean } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [width, setWidth] = useState(1200)
  const fileInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
  if (!token && !loading) {
    window.location.href = '/login'
  }
}, [token, loading])

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
      const [itemsRes, foldersRes] = await Promise.all([
        fetch(`${API}/api/vault`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/vault/folders`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const itemsData = await itemsRes.json()
      const foldersData = await foldersRes.json()
      setItems(itemsData.items || [])
      setFolders(foldersData.folders || [])
    } catch {}
    setLoading(false)
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])

  // Close context menu on click
  useEffect(() => {
    const close = () => setContextMenu(null)
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

  const navigateToFolder = (folder: Folder) => {
    setCurrentFolder(folder.id)
    setBreadcrumb(prev => [...prev, { id: folder.id, name: folder.name }])
    setSelectedItems(new Set())
  }

  const navigateBreadcrumb = (index: number) => {
    const crumb = breadcrumb[index]
    setCurrentFolder(crumb.id)
    setBreadcrumb(prev => prev.slice(0, index + 1))
    setSelectedItems(new Set())
  }

  const createFolder = async () => {
    if (!newFolderName.trim() || !token) return
    try {
      const res = await fetch(`${API}/api/vault/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newFolderName.trim(), parent_id: currentFolder }),
      })
      const folder = await res.json()
      setFolders(prev => [...prev, folder])
      setNewFolderName('')
      setShowNewFolder(false)
    } catch {}
  }

  const deleteFolder = async (folderId: string) => {
    if (!token) return
    await fetch(`${API}/api/vault/folders/${folderId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setFolders(prev => prev.filter(f => f.id !== folderId))
  }

  const deleteItem = async (itemId: string) => {
    if (!token) return
    await fetch(`${API}/api/vault/${itemId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  const renameItem = async () => {
    if (!renaming || !token) return
    if (renaming.type === 'item') {
      await fetch(`${API}/api/vault/${renaming.id}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: renaming.value }),
      })
      setItems(prev => prev.map(i => i.id === renaming.id ? { ...i, title: renaming.value } : i))
    } else {
      // folder rename — not in backend yet, update locally
      setFolders(prev => prev.map(f => f.id === renaming.id ? { ...f, name: renaming.value } : f))
    }
    setRenaming(null)
  }

  const uploadFile = async (file: File) => {
    if (!token) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)
    if (currentFolder) formData.append('folder_id', currentFolder)
    try {
      const res = await fetch(`${API}/api/vault/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (res.ok) await fetchData()
    } catch (e) {
      console.error('Upload error:', e)
      alert('Upload failed. Please try again.')
    }
    setUploading(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(uploadFile)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    files.forEach(uploadFile)
  }

  const openPreview = async (item: VaultItem) => {
    if (item.source === 'file') {
      try {
        const res = await fetch(`${API}/api/vault/file/${item.id}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        setPreview({ item, url: data.url })
      } catch {}
    } else {
      setPreview({ item })
    }
    setAnalysis(null)
  }

  const analyzeItem = async (item: VaultItem) => {
    if (!token) return
    setAnalysis({ text: '', loading: true })
    try {
      const res = await fetch(`${API}/api/vault/analyze/${item.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setAnalysis({ text: data.analysis, loading: false })
    } catch {
      setAnalysis({ text: 'Analysis failed. Please try again.', loading: false })
    }
  }

  const bg = '#080809'
  const sidebar = '#060608'
  const surface = 'rgba(255,255,255,0.03)'
  const surfaceHover = 'rgba(255,255,255,0.06)'
  const border = 'rgba(255,255,255,0.08)'
  const borderHi = 'rgba(255,255,255,0.18)'
  const tp = '#ffffff'
  const tm = 'rgba(255,255,255,0.6)'
  const td = 'rgba(255,255,255,0.3)'
  const gold = '#C7A56A'

  const totalItems = items.length
  const totalFolders = folders.length

  return (
    <div style={{ height: '100vh', background: bg, color: tp, fontFamily: 'system-ui,sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .vault-item:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.12) !important; }
        .vault-item:hover .item-actions { opacity: 1 !important; }
        .folder-item:hover { background: rgba(255,255,255,0.06) !important; }
        .sidebar-item:hover { background: rgba(255,255,255,0.06) !important; }
        .ctx-item:hover { background: rgba(255,255,255,0.08) !important; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* TOP BAR */}
      <div style={{ borderBottom: `1px solid ${border}`, padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,6,8,0.95)', backdropFilter: 'blur(12px)', flexShrink: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
            <LogoMark size={20} color={tp}/>
            <span style={{ fontSize: 14, fontWeight: 700, color: tp }}>LexIndia</span>
          </button>
          <span style={{ color: td }}>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize: 14, fontWeight: 600, color: gold }}>LexVault</span>
          </div>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 400, margin: '0 24px', position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={td} strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files and folders..."
            style={{ width: '100%', background: surface, border: `1px solid ${border}`, borderRadius: 8, padding: '8px 12px 8px 36px', fontSize: 13, color: tp, outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = borderHi} onBlur={e => e.target.style.borderColor = border}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: surface, border: `1px solid ${border}`, borderRadius: 8, overflow: 'hidden' }}>
            {(['grid', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '6px 10px', background: view === v ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', cursor: 'pointer', color: view === v ? tp : td, display: 'flex', alignItems: 'center' }}>
                {v === 'grid' ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                )}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 8, padding: '6px 10px', fontSize: 12, color: tm, outline: 'none', cursor: 'pointer' }}>
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="type">Type</option>
          </select>

          {/* Upload */}
          <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileInput}/>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ padding: '7px 14px', background: `rgba(199,165,106,0.12)`, border: `1px solid rgba(199,165,106,0.3)`, borderRadius: 8, color: gold, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            {uploading ? <div style={{ width: 12, height: 12, border: `2px solid ${gold}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/> : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* SIDEBAR */}
        {!isMobile && (
          <div style={{ width: 220, flexShrink: 0, background: sidebar, borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', padding: '12px 8px' }}>
            <button className="sidebar-item" onClick={() => { setCurrentFolder(null); setBreadcrumb([{ id: null, name: 'My Vault' }]) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: currentFolder === null ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', cursor: 'pointer', color: tp, fontFamily: 'inherit', fontSize: 13, width: '100%', textAlign: 'left', marginBottom: 4 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              My Vault
            </button>

            <div style={{ fontSize: 10, color: td, letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 12px 4px', fontWeight: 600 }}>Folders</div>
            {folders.filter(f => f.parent_id === null).map(f => (
              <button key={f.id} className="sidebar-item" onClick={() => navigateToFolder(f)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: currentFolder === f.id ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', cursor: 'pointer', color: tm, fontFamily: 'inherit', fontSize: 12, width: '100%', textAlign: 'left', marginBottom: 2 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              </button>
            ))}

            <button onClick={() => setShowNewFolder(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: td, fontFamily: 'inherit', fontSize: 12, marginTop: 4, textAlign: 'left' }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = tm}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = td}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Folder
            </button>

            <div style={{ flex: 1 }}/>

            {/* Storage info */}
            <div style={{ padding: '12px', borderTop: `1px solid ${border}`, marginTop: 8 }}>
              <div style={{ fontSize: 11, color: td, marginBottom: 6 }}>Storage</div>
              <div style={{ fontSize: 12, color: tm }}>{totalItems} files · {totalFolders} folders</div>
              <div style={{ marginTop: 8, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                <div style={{ width: `${Math.min((totalItems / 100) * 100, 100)}%`, height: '100%', background: gold, borderRadius: 2 }}/>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}>

          {/* Drag overlay */}
          {dragging && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(199,165,106,0.08)', border: `2px dashed rgba(199,165,106,0.4)`, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: 18, color: gold, fontWeight: 600 }}>Drop files to upload</div>
            </div>
          )}

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {breadcrumb.map((crumb, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ color: td, fontSize: 12 }}>›</span>}
                <button onClick={() => navigateBreadcrumb(i)} style={{ background: 'none', border: 'none', cursor: i < breadcrumb.length - 1 ? 'pointer' : 'default', color: i === breadcrumb.length - 1 ? tp : td, fontSize: 13, fontFamily: 'inherit', padding: '2px 4px', borderRadius: 4 }}
                  onMouseEnter={e => { if (i < breadcrumb.length - 1) (e.currentTarget as HTMLButtonElement).style.color = tm }}
                  onMouseLeave={e => { if (i < breadcrumb.length - 1) (e.currentTarget as HTMLButtonElement).style.color = td }}>
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>

          {/* New folder input */}
          {showNewFolder && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, animation: 'fadeIn 0.2s ease' }}>
              <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder name..." autoFocus
                onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') { setShowNewFolder(false); setNewFolderName('') } }}
                style={{ background: surface, border: `1px solid ${borderHi}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, color: tp, outline: 'none', fontFamily: 'inherit', width: 200 }}/>
              <button onClick={createFolder} style={{ padding: '8px 16px', background: `rgba(199,165,106,0.12)`, border: `1px solid rgba(199,165,106,0.3)`, borderRadius: 8, color: gold, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Create</button>
              <button onClick={() => { setShowNewFolder(false); setNewFolderName('') }} style={{ padding: '8px 12px', background: surface, border: `1px solid ${border}`, borderRadius: 8, color: td, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', color: td }}>Loading...</div>
          ) : filteredFolders.length === 0 && filteredItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={td} strokeWidth="1" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div style={{ fontSize: 14, color: td }}>
                {search ? 'No files found' : 'Vault is empty — upload files or save from other modules'}
              </div>
              <button onClick={() => fileInputRef.current?.click()} style={{ padding: '10px 20px', background: `rgba(199,165,106,0.12)`, border: `1px solid rgba(199,165,106,0.3)`, borderRadius: 8, color: gold, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Upload Files
              </button>
            </div>
          ) : view === 'grid' ? (
            <div>
              {/* Folders */}
              {filteredFolders.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: td, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>Folders</div>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 140 : 160}px, 1fr))`, gap: 8 }}>
                    {filteredFolders.map(f => (
                      <div key={f.id} className="folder-item"
                        onDoubleClick={() => navigateToFolder(f)}
                        onClick={() => navigateToFolder(f)}
                        onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, folder: f }) }}
                        style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: '16px', cursor: 'pointer', transition: 'all 0.15s', animation: 'fadeIn 0.2s ease', position: 'relative' }}>
                        {renaming?.id === f.id ? (
                          <input value={renaming.value} onChange={e => setRenaming({ ...renaming, value: e.target.value })} autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') renameItem(); if (e.key === 'Escape') setRenaming(null) }}
                            onClick={e => e.stopPropagation()}
                            style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: `1px solid ${borderHi}`, borderRadius: 4, padding: '2px 6px', fontSize: 12, color: tp, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
                        ) : (
                          <>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.2" strokeLinecap="round" style={{ marginBottom: 10 }}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" fill="rgba(199,165,106,0.1)"/></svg>
                            <div style={{ fontSize: 12, fontWeight: 600, color: tm, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                            <div style={{ fontSize: 10, color: td, marginTop: 2 }}>{folders.filter(sf => sf.parent_id === f.id).length} folders · {items.filter(i => i.folder_id === f.id).length} files</div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {filteredItems.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: td, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>Files</div>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 140 : 160}px, 1fr))`, gap: 8 }}>
                    {filteredItems.map(item => {
                      const { icon, color } = getFileIcon(item.source, item.title)
                      const isSelected = selectedItems.has(item.id)
                      return (
                        <div key={item.id} className="vault-item"
                          onClick={e => { if (e.ctrlKey || e.metaKey) { setSelectedItems(prev => { const n = new Set(prev); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n }) } else { openPreview(item) } }}
                          onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, item }) }}
                          style={{ background: isSelected ? 'rgba(199,165,106,0.08)' : surface, border: `1px solid ${isSelected ? 'rgba(199,165,106,0.3)' : border}`, borderRadius: 10, padding: '16px', cursor: 'pointer', transition: 'all 0.15s', animation: 'fadeIn 0.2s ease', position: 'relative' }}>
                          <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: tm, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{item.title}</div>
                          <div style={{ fontSize: 10, color: td }}>{formatDate(item.created_at)}</div>
                          <div className="item-actions" style={{ position: 'absolute', top: 8, right: 8, opacity: 0, transition: 'opacity 0.15s', display: 'flex', gap: 4 }}>
                            <button onClick={e => { e.stopPropagation(); analyzeItem(item); openPreview(item) }} title="AI Analyze" style={{ background: 'rgba(199,165,106,0.15)', border: 'none', borderRadius: 4, padding: '3px 5px', cursor: 'pointer', fontSize: 10, color: gold }}>✨</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // LIST VIEW
            <div>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 80px', gap: 16, padding: '8px 12px', borderBottom: `1px solid ${border}`, fontSize: 11, color: td, letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 600 }}>
                <span>Name</span><span>Type</span><span>Date</span><span>Size</span>
              </div>
              {filteredFolders.map(f => (
                <div key={f.id} className="folder-item" onDoubleClick={() => navigateToFolder(f)}
                  onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, folder: f }) }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 80px', gap: 16, padding: '10px 12px', borderBottom: `1px solid rgba(255,255,255,0.04)`, cursor: 'pointer', transition: 'background 0.1s', borderRadius: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                    <span style={{ fontSize: 13, color: tm }}>{f.name}</span>
                  </div>
                  <span style={{ fontSize: 12, color: td, alignSelf: 'center' }}>Folder</span>
                  <span style={{ fontSize: 12, color: td, alignSelf: 'center' }}>{formatDate(f.created_at)}</span>
                  <span style={{ fontSize: 12, color: td, alignSelf: 'center' }}>—</span>
                </div>
              ))}
              {filteredItems.map(item => {
                const { icon, color, label } = getFileIcon(item.source, item.title)
                return (
                  <div key={item.id} className="vault-item" onClick={() => openPreview(item)}
                    onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, item }) }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 80px', gap: 16, padding: '10px 12px', borderBottom: `1px solid rgba(255,255,255,0.04)`, cursor: 'pointer', transition: 'background 0.1s', borderRadius: 6, border: `1px solid transparent` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{icon}</span>
                      <span style={{ fontSize: 13, color: tm, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                    </div>
                    <span style={{ fontSize: 11, color, alignSelf: 'center', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 12, color: td, alignSelf: 'center' }}>{formatDate(item.created_at)}</span>
                    <span style={{ fontSize: 12, color: td, alignSelf: 'center' }}>{formatSize(item.file_size)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* CONTEXT MENU */}
      {contextMenu && (
        <div style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, background: '#111113', border: `1px solid ${border}`, borderRadius: 10, padding: '6px', zIndex: 200, minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', animation: 'fadeIn 0.15s ease' }}
          onClick={e => e.stopPropagation()}>
          {contextMenu.item && (
            <>
              <button className="ctx-item" onClick={() => { openPreview(contextMenu.item!); setContextMenu(null) }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: tm, fontFamily: 'inherit', fontSize: 13, borderRadius: 6, textAlign: 'left' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Open
              </button>
              <button className="ctx-item" onClick={() => { analyzeItem(contextMenu.item!); openPreview(contextMenu.item!); setContextMenu(null) }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: gold, fontFamily: 'inherit', fontSize: 13, borderRadius: 6, textAlign: 'left' }}>
                ✨ AI Analyze
              </button>
              <button className="ctx-item" onClick={() => { setRenaming({ id: contextMenu.item!.id, value: contextMenu.item!.title, type: 'item' }); setContextMenu(null) }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: tm, fontFamily: 'inherit', fontSize: 13, borderRadius: 6, textAlign: 'left' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Rename
              </button>
              {contextMenu.item.source === 'file' && (
                <button className="ctx-item" onClick={async () => {
                  const res = await fetch(`${API}/api/vault/file/${contextMenu.item!.id}`, { headers: { Authorization: `Bearer ${token}` } })
                  const data = await res.json()
                  window.open(data.url, '_blank')
                  setContextMenu(null)
                }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: tm, fontFamily: 'inherit', fontSize: 13, borderRadius: 6, textAlign: 'left' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download
                </button>
              )}
              <div style={{ height: 1, background: border, margin: '4px 8px' }}/>
              <button className="ctx-item" onClick={() => { deleteItem(contextMenu.item!.id); setContextMenu(null) }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontFamily: 'inherit', fontSize: 13, borderRadius: 6, textAlign: 'left' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                Delete
              </button>
            </>
          )}
          {contextMenu.folder && (
            <>
              <button className="ctx-item" onClick={() => { navigateToFolder(contextMenu.folder!); setContextMenu(null) }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: tm, fontFamily: 'inherit', fontSize: 13, borderRadius: 6, textAlign: 'left' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                Open
              </button>
              <button className="ctx-item" onClick={() => { setRenaming({ id: contextMenu.folder!.id, value: contextMenu.folder!.name, type: 'folder' }); setContextMenu(null) }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: tm, fontFamily: 'inherit', fontSize: 13, borderRadius: 6, textAlign: 'left' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Rename
              </button>
              <div style={{ height: 1, background: border, margin: '4px 8px' }}/>
              <button className="ctx-item" onClick={() => { deleteFolder(contextMenu.folder!.id); setContextMenu(null) }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontFamily: 'inherit', fontSize: 13, borderRadius: 6, textAlign: 'left' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                Delete Folder
              </button>
            </>
          )}
        </div>
      )}

      {/* FILE PREVIEW PANEL */}
      {preview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => { setPreview(null); setAnalysis(null) }}>
          <div style={{ background: '#0d0d0f', border: `1px solid ${border}`, borderRadius: 16, width: '100%', maxWidth: 800, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease' }} onClick={e => e.stopPropagation()}>

            {/* Preview header */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{getFileIcon(preview.item.source, preview.item.title).icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: tp }}>{preview.item.title}</div>
                  <div style={{ fontSize: 11, color: td }}>{preview.item.source} · {formatDate(preview.item.created_at)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => analyzeItem(preview.item)} style={{ padding: '7px 14px', background: `rgba(199,165,106,0.12)`, border: `1px solid rgba(199,165,106,0.3)`, borderRadius: 8, color: gold, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                  ✨ AI Analyze
                </button>
                {preview.url && (
                  <a href={preview.url} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 14px', background: surface, border: `1px solid ${border}`, borderRadius: 8, color: tm, fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download
                  </a>
                )}
                <button onClick={() => { setPreview(null); setAnalysis(null) }} style={{ padding: '7px 10px', background: surface, border: `1px solid ${border}`, borderRadius: 8, color: td, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
              </div>
            </div>

            {/* Preview content */}
            <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', gap: 20 }}>

              {/* Document content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {preview.url ? (
                  <iframe src={preview.url} style={{ width: '100%', height: 400, border: 'none', borderRadius: 8, background: '#fff' }} title={preview.item.title}/>
                ) : (
                  <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 10, padding: 20, maxHeight: 400, overflow: 'auto' }}>
                    <pre style={{ fontSize: 13, color: tm, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'system-ui', margin: 0 }}>
                      {preview.item.content || 'No preview available'}
                    </pre>
                  </div>
                )}
              </div>

              {/* AI Analysis panel */}
              {analysis && (
                <div style={{ width: 300, flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: gold, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    ✨ AI Analysis
                  </div>
                  {analysis.loading ? (
                    <div style={{ display: 'flex', gap: 5, padding: 20 }}>
                      {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: gold, animation: `fadeIn 1s ease-in-out ${i*0.2}s infinite alternate` }}/>)}
                    </div>
                  ) : (
                    <div style={{ background: `rgba(199,165,106,0.04)`, border: `1px solid rgba(199,165,106,0.15)`, borderRadius: 10, padding: 16, fontSize: 13, color: tm, lineHeight: 1.7, maxHeight: 380, overflow: 'auto' }}>
                      {analysis.text}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}