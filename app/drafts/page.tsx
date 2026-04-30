'use client'
import { useAuth } from '../auth/AuthContext'
import { useState, useEffect } from 'react'

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

const DOC_TYPES: Record<string, string[]> = {
  'Criminal': [
    'Regular Bail Application (S.483 BNSS)',
    'Anticipatory Bail Application (S.482 BNSS)',
    'Quashing Petition (S.528 BNSS)',
    'Discharge Application',
    'Default Bail Application (S.187 BNSS)',
    'Revision Petition (Criminal)',
    'Surrender Application',
    'Bail Cancellation Opposition',
  ],
  'Supreme Court': [
    'SLP (Civil) — Art. 136',
    'SLP (Criminal) — Art. 136',
    'Civil Appeal',
    'Criminal Appeal',
    'Review Petition',
    'Curative Petition',
    'Writ Petition (Art. 32) — Fundamental Rights',
    'Transfer Petition',
  ],
  'High Court': [
    'Writ Petition (Art. 226) — Mandamus',
    'Writ Petition (Art. 226) — Certiorari',
    'Writ Petition (Art. 226) — Habeas Corpus',
    'Writ Appeal',
    'Criminal Appeal',
    'Criminal Revision Petition',
    'Anticipatory Bail (High Court)',
    'Letters Patent Appeal',
  ],
  'Civil': [
    'Plaint',
    'Written Statement',
    'Interlocutory Application',
    'Contempt Petition',
    'Execution Application',
    'Revision Petition (Civil)',
    'Appeal against Decree',
    'Injunction Application (Order 39 CPC)',
  ],
  'Affidavits': [
    'General Affidavit',
    'Supporting Affidavit',
    'Counter Affidavit',
    'Rejoinder Affidavit',
    'Affidavit of Assets and Liabilities',
    'Affidavit of Undertaking',
    'Affidavit in lieu of Examination in Chief',
  ],
  'Notices': [
    'Legal Notice',
    'Reply to Legal Notice',
    'Cheque Bounce Notice (S.138 NI Act)',
    'Consumer Complaint Notice',
    'RTI Application',
    'Section 80 CPC Notice',
    'Eviction Notice',
    'Defamation Notice',
  ],
  'General': [
    'Vakalatnama',
    'Memo of Appearance',
    'Power of Attorney (General)',
    'Power of Attorney (Special)',
    'Rent Agreement',
    'MOU (Memorandum of Understanding)',
    'Settlement Agreement',
    'Consumer Complaint (NCDRC/State/District)',
  ],
}

const CATEGORIES = Object.keys(DOC_TYPES)

function renderMarkdown(text: string) {
  return text
    .replace(/^# (.+)$/gm, '<h1 style="font-size:18px;font-weight:800;color:#fff;margin:16px 0 8px;letter-spacing:-0.5px;">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:15px;font-weight:700;color:#fff;margin:14px 0 6px;">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);margin:10px 0 4px;letter-spacing:0.5px;text-transform:uppercase;">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff;font-weight:700;">$1</strong>')
    .replace(/^- (.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0;"><span style="color:rgba(255,255,255,0.3);font-size:10px;margin-top:3px;">▸</span><span style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;">$1</span></div>')
    .replace(/^(\d+)\. (.+)$/gm, '<div style="display:flex;gap:8px;margin:3px 0;"><span style="color:rgba(255,255,255,0.4);font-size:12px;min-width:16px;">$1.</span><span style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;">$2</span></div>')
    .replace(/^(═+)$/gm, '<div style="height:1px;background:rgba(255,255,255,0.1);margin:12px 0;"></div>')
    .replace(/^(─+)$/gm, '<div style="height:1px;background:rgba(255,255,255,0.06);margin:8px 0;"></div>')
    .replace(/\n\n/g, '<div style="height:8px"></div>')
}

export default function Drafts() {
  const [winW, setWinW] = useState(1200)
  useEffect(() => { setWinW(window.innerWidth); const h = () => setWinW(window.innerWidth); window.addEventListener('resize',h); return () => window.removeEventListener('resize',h) }, [])
  const { token } = useAuth()
  const [dark, setDark] = useState(true)
  const [category, setCategory] = useState('Criminal')
  const [docType, setDocType] = useState(DOC_TYPES['Criminal'][0])
  const [court, setCourt] = useState('')
  const [petitioner, setPetitioner] = useState('')
  const [respondent, setRespondent] = useState('')
  const [caseNumber, setCaseNumber] = useState('')
  const [advocate, setAdvocate] = useState('')
  const [date, setDate] = useState('')
  const [facts, setFacts] = useState('')
  const [grounds, setGrounds] = useState('')
  const [loading, setLoading] = useState(false)
  const [document, setDocument] = useState('')
  const [copied, setCopied] = useState(false)

  const bg        = dark ? '#080809'                : '#F8F8F6'
  const bgSurface = dark ? '#0d0d0f'                : '#ffffff'
  const border    = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const borderHi  = dark ? 'rgba(255,255,255,0.2)'  : 'rgba(0,0,0,0.2)'
  const tp        = dark ? '#ffffff'                : '#0a0a0b'
  const tm        = dark ? 'rgba(255,255,255,0.6)'  : 'rgba(0,0,0,0.6)'
  const td        = dark ? 'rgba(255,255,255,0.3)'  : 'rgba(0,0,0,0.35)'
  const navBg     = dark ? 'rgba(8,8,9,0.92)'       : 'rgba(248,248,246,0.92)'
  const inputBg   = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const btnBg     = dark ? '#ffffff'                : '#0a0a0b'
  const btnTxt    = dark ? '#000000'                : '#ffffff'
  const logoColor = dark ? '#ffffff'                : '#0a0a0b'
  const catBg     = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'
  const catActive = dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.1)'

  const inputStyle = {
    width: '100%',
    background: inputBg,
    border: `1px solid ${border}`,
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    color: tp,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  const labelStyle = {
    fontSize: 11,
    color: td,
    letterSpacing: 0.5,
    marginBottom: 6,
    display: 'block' as const,
  }

  const generate = async () => {
    if (!petitioner || !facts) return
    setLoading(true)
    setDocument('')
    try {
      const res = await fetch('https://lexindia-backend-production.up.railway.app/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_type: docType,
          court,
          petitioner,
          respondent,
          facts,
          grounds,
        }),
      })
      const data = await res.json()
      setDocument(data.document)
    } catch {
      setDocument('Could not connect to backend. Make sure the server is running on port 8000.')
    }
    setLoading(false)
  }

  const copyDoc = () => {
    navigator.clipboard.writeText(document)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main style={{ minHeight: '100vh', background: bg, color: tp, fontFamily: 'system-ui,sans-serif', transition: 'background 0.3s' }}>
      <style>{`
        input::placeholder, textarea::placeholder { color: ${td}; }
        select option { background: #0d0d0f; color: #fff; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${border}; border-radius: 2px; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ borderBottom: `1px solid ${border}`, padding: winW < 640 ? '12px 16px' : '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, background: navBg, backdropFilter: 'blur(12px)', transition: 'background 0.3s' }}>
        <button onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer' }}>
          <LogoMark size={28} color={logoColor}/>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: tp, letterSpacing: 3 }}>LEX</span>
            <span style={{ fontSize: 14, fontWeight: 200, color: tp, letterSpacing: 3 }}>INDIA</span>
          </div>
        </button>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, alignItems: 'center' }}>
          <span style={{ color: td, cursor: 'pointer' }} onClick={() => window.location.href = '/research'}>Research</span>
          <span style={{ color: td, cursor: 'pointer' }} onClick={() => window.location.href = '/assistant'}>Assistant</span>
          <span style={{ color: tp, fontWeight: 600 }}>Drafts</span>
          <button onClick={() => setDark(d => !d)} style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', border: `1px solid ${border}`, borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 11, color: td, fontFamily: 'inherit', transition: 'all 0.3s', letterSpacing: 1 }}>
            {dark ? '○ Light' : '● Dark'}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: td, marginBottom: 10, textTransform: 'uppercase' }}>LexDraft</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: tp, letterSpacing: -1, marginBottom: 8 }}>Legal Document Generator</h1>
          <p style={{ fontSize: 14, color: tm, lineHeight: 1.6 }}>
            56 document types · BNS/BNSS · IPC/CrPC · Supreme Court to District Court
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: winW < 768 ? '1fr' : '320px 1fr', gap: 20 }}>

          {/* LEFT — FORM */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Category selector */}
            <div style={{ background: bgSurface, border: `1px solid ${border}`, borderRadius: 12, padding: 16, transition: 'background 0.3s' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: td, marginBottom: 12, textTransform: 'uppercase' }}>Category</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { setCategory(cat); setDocType(DOC_TYPES[cat][0]) }} style={{
                    background: category === cat ? catActive : 'transparent',
                    border: `1px solid ${category === cat ? borderHi : 'transparent'}`,
                    borderRadius: 8, padding: '8px 12px',
                    fontSize: 12, color: category === cat ? tp : tm,
                    cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: 'left', transition: 'all 0.15s',
                    fontWeight: category === cat ? 600 : 400,
                  }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Document type */}
            <div style={{ background: bgSurface, border: `1px solid ${border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: td, marginBottom: 10, textTransform: 'uppercase' }}>Document Type</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {DOC_TYPES[category].map(dt => (
                  <button key={dt} onClick={() => setDocType(dt)} style={{
                    background: docType === dt ? catActive : 'transparent',
                    border: `1px solid ${docType === dt ? borderHi : 'transparent'}`,
                    borderRadius: 6, padding: '7px 10px',
                    fontSize: 11, color: docType === dt ? tp : tm,
                    cursor: 'pointer', fontFamily: 'inherit',
                    textAlign: 'left', transition: 'all 0.15s',
                    lineHeight: 1.4,
                    fontWeight: docType === dt ? 600 : 400,
                  }}>
                    {dt}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT — DETAILS + OUTPUT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Form fields */}
            <div style={{ background: bgSurface, border: `1px solid ${border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: td, marginBottom: 16, textTransform: 'uppercase' }}>
                {docType}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: winW < 640 ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Court Name</label>
                  <input value={court} onChange={e => setCourt(e.target.value)} placeholder="e.g. High Court of Delhi" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = borderHi}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Case Number (if any)</label>
                  <input value={caseNumber} onChange={e => setCaseNumber(e.target.value)} placeholder="e.g. FIR No. 123/2024" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = borderHi}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Petitioner / Applicant Name *</label>
                  <input value={petitioner} onChange={e => setPetitioner(e.target.value)} placeholder="e.g. Ramesh Kumar" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = borderHi}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Respondent Name</label>
                  <input value={respondent} onChange={e => setRespondent(e.target.value)} placeholder="e.g. State of Delhi" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = borderHi}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Advocate Name</label>
                  <input value={advocate} onChange={e => setAdvocate(e.target.value)} placeholder="e.g. Adv. Suresh Sharma" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = borderHi}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input value={date} onChange={e => setDate(e.target.value)} placeholder="e.g. 26th April 2026" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = borderHi}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Brief Facts of the Case *</label>
                <textarea value={facts} onChange={e => setFacts(e.target.value)}
                  placeholder="Describe the facts of the case in brief — what happened, who is involved, what the dispute is about..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = borderHi}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Grounds / Prayer</label>
                <textarea value={grounds} onChange={e => setGrounds(e.target.value)}
                  placeholder="List the grounds for relief or specific prayer sought..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = borderHi}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>

              <button
                onClick={generate}
                disabled={loading || !petitioner || !facts}
                style={{
                  width: '100%',
                  background: petitioner && facts && !loading ? btnBg : (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                  color: petitioner && facts && !loading ? btnTxt : td,
                  border: 'none', borderRadius: 10,
                  padding: '12px', fontSize: 13, fontWeight: 700,
                  cursor: petitioner && facts && !loading ? 'pointer' : 'default',
                  fontFamily: 'inherit', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 14, height: 14, border: `2px solid ${td}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
                    Drafting document...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Generate Document
                  </>
                )}
              </button>

              {!petitioner && <p style={{ fontSize: 11, color: td, marginTop: 8, textAlign: 'center' }}>* Petitioner name and facts are required</p>}
            </div>

            {/* GENERATED DOCUMENT */}
            {document && (
              <div style={{ background: bgSurface, border: `1px solid ${border}`, borderRadius: 12, padding: 24, animation: 'fadeIn 0.4s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: td, textTransform: 'uppercase', marginBottom: 4 }}>Generated Document</div>
                    <div style={{ fontSize: 13, color: tm }}>{docType}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={copyDoc} style={{
                      background: copied ? 'rgba(63,185,80,0.12)' : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                      border: `1px solid ${copied ? 'rgba(63,185,80,0.3)' : border}`,
                      borderRadius: 8, padding: '7px 16px',
                      fontSize: 11, color: copied ? '#3fb950' : tm,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                    <button onClick={() => {
                      const blob = new Blob([document], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = window.document.createElement('a')
                      a.href = url
                      a.download = `${docType.replace(/[^a-zA-Z0-9]/g, '_')}_${petitioner.replace(/\s/g, '_')}.txt`
                      a.click()
                      URL.revokeObjectURL(url)
                    }} style={{
                      background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                      border: `1px solid ${border}`,
                      borderRadius: 8, padding: '7px 16px',
                      fontSize: 11, color: tm,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Download
                    </button>
                    <button onClick={() => { setDocument(''); setPetitioner(''); setFacts(''); setGrounds('') }} style={{
                      background: 'transparent',
                      border: `1px solid ${border}`,
                      borderRadius: 8, padding: '7px 16px',
                      fontSize: 11, color: td,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      New Draft
                    </button>
                  </div>
                </div>

                {/* Document content */}
                <div style={{
                  background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${border}`,
                  borderRadius: 8, padding: '24px',
                  fontFamily: 'Georgia, serif',
                  maxHeight: '60vh', overflowY: 'auto',
                  lineHeight: 1.8,
                }}>
                  <div
                    style={{ fontSize: 13, color: tm }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(document) }}
                  />
                </div>

                <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,165,0,0.06)', border: '1px solid rgba(255,165,0,0.15)', borderRadius: 8 }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,165,0,0.8)', margin: 0, lineHeight: 1.5 }}>
                    ⚠ Review this document carefully before filing. Verify all citations, section numbers, and party details. AI may occasionally make errors in specific citations or local court rules.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}