'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Grid3X3, X, Check } from 'lucide-react'
import Shell from '../../components/Shell'
import ImageUpload from '../../components/ImageUpload'
import { api, getToken } from '../../lib/api'
import { toast } from '../../lib/toast'

const EMPTY = { name:'', slug:'', is_active:true, sort_order:0 }

export default function CategoriesPage() {
  const router = useRouter()
  const [cats, setCats]       = useState<any[]>([])
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm]       = useState<any>(EMPTY)
  const [img, setImg]         = useState<string[]>([])
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (!getToken()) { router.replace('/'); return }
    load()
  }, [])

  const load     = () => api.get('/api/categories/all').then(r => setCats(r.data)).catch(()=>{})
  const autoSlug = (n: string) => n.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')

  const openForm = (c?: any) => {
    setEditing(c||null)
    setForm(c ? { name:c.name, slug:c.slug, is_active:c.is_active, sort_order:c.sort_order } : EMPTY)
    setImg(c?.image_url ? [c.image_url] : [])
    setOpen(true)
  }

  const save = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      const body = { ...form, image_url: img[0]||'' }
      if (editing) { await api.put(`/api/categories/${editing.id}`, body); toast.success('Category updated!') }
      else         { await api.post('/api/categories', body); toast.success('Category created!') }
      setOpen(false); load()
    } catch { toast.error('Failed to save') }
    setSaving(false)
  }

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try { await api.delete(`/api/categories/${id}`); toast.success('Category deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  const sf = (k: string, v: any) => setForm((f: any) => ({...f,[k]:v}))
  const iS: React.CSSProperties = { background:'var(--s2)', border:'1.5px solid var(--bdr2)', borderRadius:12, padding:'12px 14px', fontSize:14, color:'var(--txt)', width:'100%' }
  const lbl: React.CSSProperties = { fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--txt3)', marginBottom:8, display:'block' }

  return (
    <Shell>
      <div className="anim-fadeup" style={{ padding:'14px' }}>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
          <button onClick={() => openForm()} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', cursor:'pointer', color:'white', fontSize:13, fontWeight:700, boxShadow:'0 4px 16px rgba(124,58,237,.35)' }}>
            <Plus size={15}/> Add Category
          </button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {cats.map((c: any) => (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18 }}>
              <div style={{ width:52, height:52, borderRadius:13, overflow:'hidden', flexShrink:0, background:'var(--s3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {c.image_url ? <img src={c.image_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" /> : <Grid3X3 size={20} color="var(--txt3)" />}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontWeight:700, fontSize:13, color:'var(--txt)' }}>{c.name}</p>
                <p style={{ fontSize:11, color:'var(--txt3)', fontFamily:'monospace', marginTop:2 }}>{c.slug}</p>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99, display:'inline-block', marginTop:4, background: c.is_active?'var(--green-lt)':'var(--s3)', color: c.is_active?'var(--green)':'var(--txt3)' }}>
                  {c.is_active ? 'Active' : 'Off'}
                </span>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                <button onClick={() => openForm(c)} style={{ width:34, height:34, borderRadius:10, background:'var(--accent-lt)', border:'1px solid rgba(124,58,237,.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <Pencil size={14} color="var(--accent-text)" />
                </button>
                <button onClick={() => del(c.id, c.name)} style={{ width:34, height:34, borderRadius:10, background:'var(--red-lt)', border:'1px solid rgba(239,68,68,.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <Trash2 size={14} color="var(--red)" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.65)', backdropFilter:'blur(4px)' }} onClick={() => setOpen(false)} />
          <div className="anim-slideup" style={{ position:'relative', width:'100%', maxHeight:'88vh', display:'flex', flexDirection:'column', background:'var(--s1)', borderRadius:'22px 22px 0 0', border:'1px solid var(--bdr2)', borderBottom:'none' }}>
            <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 4px' }}><div style={{ width:36, height:3, borderRadius:99, background:'var(--s4)' }} /></div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 18px 12px', borderBottom:'1px solid var(--bdr)' }}>
              <p style={{ fontWeight:800, fontSize:15, color:'var(--txt)' }}>{editing ? 'Edit Category' : 'New Category'}</p>
              <button onClick={() => setOpen(false)} style={{ width:30, height:30, borderRadius:8, background:'var(--s3)', border:'1px solid var(--bdr)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={14} color="var(--txt2)" /></button>
            </div>
            <div style={{ overflowY:'auto', flex:1, padding:'16px 18px', display:'flex', flexDirection:'column', gap:12 }}>
              <input value={form.name} onChange={e => { sf('name', e.target.value); if(!editing) sf('slug', autoSlug(e.target.value)) }} placeholder="Category Name *" style={iS} />
              <input value={form.slug} onChange={e => sf('slug', e.target.value)} placeholder="Slug" style={{ ...iS, fontFamily:'monospace' }} />
              <input value={form.sort_order} type="number" onChange={e => sf('sort_order', +e.target.value)} placeholder="Sort Order" style={iS} />
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, fontWeight:600, color:'var(--txt2)' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => sf('is_active', e.target.checked)} /> Active
              </label>
              <div><span style={lbl}>Image</span><ImageUpload value={img} onChange={setImg} max={1} folder="categories" /></div>
              <div style={{ display:'flex', gap:10, paddingBottom:24 }}>
                <button onClick={() => setOpen(false)} style={{ flex:1, padding:'13px', borderRadius:12, background:'var(--s3)', border:'1px solid var(--bdr2)', color:'var(--txt2)', fontWeight:600, fontSize:14, cursor:'pointer' }}>Cancel</button>
                <button onClick={save} disabled={saving||!form.name} style={{ flex:1, padding:'13px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:14, color:'white', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity: !form.name?0.5:1 }}>
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
