'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Image, X, Check, GripVertical } from 'lucide-react'
import Shell from '../../components/Shell'
import ImageUpload from '../../components/ImageUpload'
import { api, getToken } from '../../lib/api'
import { toast } from '../../lib/toast'

const EMPTY = { image_url:'', link:'', title:'', sort_order:0, is_active:true }

export default function BannersPage() {
  const router = useRouter()
  const [banners, setBanners] = useState<any[]>([])
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm]       = useState<any>(EMPTY)
  const [imgs, setImgs]       = useState<string[]>([])
  const [saving, setSaving]   = useState(false)

  useEffect(() => { if (!getToken()) { router.replace('/'); return }; load() }, [])
  const load = () => api.get('/api/admin/banners').then(r => setBanners(r.data)).catch(()=>{})

  const openForm = (b?: any) => {
    setEditing(b||null)
    setForm(b ? { image_url:b.image_url, link:b.link||'', title:b.title||'', sort_order:b.sort_order, is_active:b.is_active } : EMPTY)
    setImgs(b?.image_url ? [b.image_url] : [])
    setOpen(true)
  }

  const save = async () => {
    if (!imgs[0]) { toast.error('Image required'); return }
    setSaving(true)
    try {
      const body = { ...form, image_url: imgs[0] }
      if (editing) { await api.put(`/api/admin/banners/${editing.id}`, body); toast.success('Banner updated!') }
      else         { await api.post('/api/admin/banners', body); toast.success('Banner created!') }
      setOpen(false); load()
    } catch { toast.error('Failed to save') }
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Delete banner?')) return
    await api.delete(`/api/admin/banners/${id}`).catch(()=>{})
    toast.success('Banner deleted'); load()
  }

  const sf = (k: string, v: any) => setForm((f:any) => ({...f,[k]:v}))
  const iS: React.CSSProperties = { background:'var(--s2)', border:'1.5px solid var(--bdr2)', borderRadius:12, padding:'12px 14px', fontSize:14, color:'var(--txt)', width:'100%' }

  return (
    <Shell>
      <div className="anim-fadeup" style={{ padding:14 }}>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
          <button onClick={() => openForm()} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', cursor:'pointer', color:'white', fontSize:13, fontWeight:700, boxShadow:'0 4px 16px rgba(124,58,237,.35)' }}>
            <Plus size={15}/> Add Banner
          </button>
        </div>
        {banners.length === 0 ? (
          <p style={{ textAlign:'center', paddingTop:60, color:'var(--txt2)' }}>No banners yet</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {banners.map((b:any) => (
              <div key={b.id} style={{ background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18, overflow:'hidden' }}>
                <div style={{ height:120, background:'var(--s3)', position:'relative' }}>
                  {b.image_url && <img src={b.image_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />}
                  <span style={{ position:'absolute', top:8, right:8, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:99, background: b.is_active?'var(--green-lt)':'var(--s4)', color: b.is_active?'var(--green)':'var(--txt3)' }}>
                    {b.is_active ? 'Active' : 'Off'}
                  </span>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px' }}>
                  <div>
                    <p style={{ fontWeight:700, fontSize:13, color:'var(--txt)' }}>{b.title || 'Untitled'}</p>
                    {b.link && <p style={{ fontSize:11, color:'var(--txt3)', marginTop:2 }}>{b.link}</p>}
                    <p style={{ fontSize:11, color:'var(--txt3)', marginTop:2 }}>Order: {b.sort_order}</p>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => openForm(b)} style={{ width:34, height:34, borderRadius:10, background:'var(--accent-lt)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      <Image size={14} color="var(--accent-text)" />
                    </button>
                    <button onClick={() => del(b.id)} style={{ width:34, height:34, borderRadius:10, background:'var(--red-lt)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                      <Trash2 size={14} color="var(--red)" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.65)' }} onClick={() => setOpen(false)} />
          <div className="anim-slideup" style={{ position:'relative', width:'100%', maxHeight:'88vh', display:'flex', flexDirection:'column', background:'var(--s1)', borderRadius:'22px 22px 0 0', border:'1px solid var(--bdr2)', borderBottom:'none' }}>
            <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 4px' }}><div style={{ width:36, height:3, borderRadius:99, background:'var(--s4)' }} /></div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 18px 12px', borderBottom:'1px solid var(--bdr)' }}>
              <p style={{ fontWeight:800, fontSize:15, color:'var(--txt)' }}>{editing ? 'Edit Banner' : 'New Banner'}</p>
              <button onClick={() => setOpen(false)} style={{ width:30, height:30, borderRadius:8, background:'var(--s3)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={14} color="var(--txt2)" /></button>
            </div>
            <div style={{ overflowY:'auto', flex:1, padding:'16px 18px', display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <p style={{ fontSize:11, fontWeight:600, color:'var(--txt3)', marginBottom:8 }}>Banner Image *</p>
                <ImageUpload value={imgs} onChange={v => { setImgs(v); sf('image_url', v[0]||'') }} max={1} folder="banners" />
              </div>
              <input value={form.title} onChange={e => sf('title', e.target.value)} placeholder="Title (optional)" style={iS} />
              <input value={form.link} onChange={e => sf('link', e.target.value)} placeholder="Link URL (optional)" style={iS} />
              <input value={form.sort_order} type="number" onChange={e => sf('sort_order', +e.target.value)} placeholder="Sort Order (0, 1, 2...)" style={iS} />
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, fontWeight:600, color:'var(--txt2)' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => sf('is_active', e.target.checked)} /> Active
              </label>
              <div style={{ display:'flex', gap:10, paddingBottom:24 }}>
                <button onClick={() => setOpen(false)} style={{ flex:1, padding:'13px', borderRadius:12, background:'var(--s3)', border:'1px solid var(--bdr2)', color:'var(--txt2)', fontWeight:600, fontSize:14, cursor:'pointer' }}>Cancel</button>
                <button onClick={save} disabled={saving||!imgs[0]} style={{ flex:1, padding:'13px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:14, color:'white', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:!imgs[0]?0.5:1 }}>
                  {saving ? 'Saving...' : <><Check size={15}/>Save</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
