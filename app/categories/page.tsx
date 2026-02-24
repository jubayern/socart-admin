'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Grid3X3, X, Check } from 'lucide-react'
import Shell from '../../components/Shell'
import ImageUpload from '../../components/ImageUpload'
import { api, getToken } from '../../lib/api'

const EMPTY = { name:'', slug:'', is_active:true, sort_order:0 }

export default function CategoriesPage() {
  const router = useRouter()
  const [cats, setCats]       = useState<any[]>([])
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm]       = useState<any>(EMPTY)
  const [image, setImage]     = useState<string[]>([])
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (!getToken()) { router.replace('/'); return }
    load()
  }, [])

  const load = () => api.get('/api/categories/all').then(r => setCats(r.data)).catch(() => {})

  const openForm = (c?: any) => {
    setEditing(c||null)
    setForm(c ? { name:c.name, slug:c.slug, is_active:c.is_active, sort_order:c.sort_order } : EMPTY)
    setImage(c?.image_url ? [c.image_url] : [])
    setOpen(true)
  }

  const autoSlug = (n: string) => n.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')

  const save = async () => {
    if (!form.name) return
    setSaving(true)
    const body = { ...form, image_url: image[0]||'' }
    if (editing) await api.put(`/api/categories/${editing.id}`, body).catch(()=>{})
    else         await api.post('/api/categories', body).catch(()=>{})
    setSaving(false); setOpen(false); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete category?')) return
    await api.delete(`/api/categories/${id}`); load()
  }

  const sf = (k: string, v: any) => setForm((f: any) => ({...f,[k]:v}))

  return (
    <Shell title="Categories">
      <div className="px-4 py-4">
        <div className="flex justify-end mb-4">
          <button onClick={() => openForm()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white"
            style={{ background:'var(--brand)' }}>
            <Plus size={16} /> Add Category
          </button>
        </div>

        {cats.length === 0 ? (
          <p className="text-center py-16 text-sm" style={{ color:'var(--muted)' }}>No categories yet</p>
        ) : (
          <div className="space-y-2.5">
            {cats.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-3xl shadow-sm" style={{ background:'var(--card)' }}>
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background:'var(--bg)' }}>
                  {c.image_url
                    ? <img src={c.image_url} className="w-full h-full object-cover" alt="" />
                    : <Grid3X3 size={22} style={{ color:'var(--border)' }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color:'var(--text)' }}>{c.name}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color:'var(--muted)' }}>{c.slug}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ background: c.is_active ? '#dcfce7' : '#f3f4f6', color: c.is_active ? '#15803d' : '#6b7280' }}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => openForm(c)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'var(--brand-light)', color:'var(--brand)' }}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => del(c.id)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'#fee2e2', color:'#ef4444' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative rounded-t-3xl flex flex-col" style={{ background:'var(--card)', maxHeight:'85vh' }}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background:'var(--border)' }} />
            </div>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom:'1px solid var(--border)' }}>
              <p className="font-bold" style={{ color:'var(--text)' }}>{editing ? 'Edit Category' : 'New Category'}</p>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'var(--bg)' }}>
                <X size={16} style={{ color:'var(--muted)' }} />
              </button>
            </div>
            <div className="overflow-auto px-5 py-4 space-y-3">
              <input value={form.name}
                onChange={e => { sf('name', e.target.value); if(!editing) sf('slug', autoSlug(e.target.value)) }}
                placeholder="Category Name *"
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none"
                style={{ background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)' }} />
              <input value={form.slug} onChange={e => sf('slug', e.target.value)} placeholder="Slug"
                className="w-full px-4 py-3 rounded-2xl text-sm font-mono outline-none"
                style={{ background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)' }} />
              <input value={form.sort_order} type="number" onChange={e => sf('sort_order', +e.target.value)} placeholder="Sort Order"
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)' }} />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => sf('is_active', e.target.checked)} />
                <span className="text-sm font-medium" style={{ color:'var(--text)' }}>Active</span>
              </label>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color:'var(--muted)' }}>Image</p>
                <ImageUpload value={image} onChange={setImage} max={1} folder="categories" />
              </div>
              <div className="flex gap-2 pb-6">
                <button onClick={() => setOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold"
                  style={{ background:'var(--bg)', color:'var(--muted)', border:'1.5px solid var(--border)' }}>Cancel</button>
                <button onClick={save} disabled={saving||!form.name}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background:'var(--brand)' }}>
                  {saving ? 'Saving...' : <><Check size={16}/> Save</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
