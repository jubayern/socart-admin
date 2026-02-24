'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X, Check, Grid3X3 } from 'lucide-react'
import Layout from '../../components/Layout'
import ImageUpload from '../../components/ImageUpload'
import { api, getToken } from '../../lib/api'

const EMPTY = { name: '', slug: '', image_url: '', is_active: true, sort_order: 0 }

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<any>(null)
  const [form, setForm]             = useState<any>(EMPTY)
  const [image, setImage]           = useState<string[]>([])
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    if (!getToken()) { router.push('/'); return }
    load()
  }, [])

  const load = () => api.get('/api/categories/all').then(r => setCategories(r.data)).catch(() => {})

  const open = (cat?: any) => {
    setEditing(cat || null)
    setForm(cat ? { name: cat.name, slug: cat.slug, image_url: cat.image_url||'', is_active: cat.is_active, sort_order: cat.sort_order } : EMPTY)
    setImage(cat?.image_url ? [cat.image_url] : [])
    setShowForm(true)
  }

  const autoSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const save = async () => {
    setSaving(true)
    const payload = { ...form, image_url: image[0] || '' }
    if (editing) await api.put(`/api/categories/${editing.id}`, payload).catch(() => {})
    else         await api.post('/api/categories', payload).catch(() => {})
    setSaving(false); setShowForm(false); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await api.delete(`/api/categories/${id}`); load()
  }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  return (
    <Layout>
      <div className="px-4 py-4">
        <div className="flex justify-end mb-3">
          <button onClick={() => open()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
            <Plus size={15} /> Add Category
          </button>
        </div>

        {categories.length === 0
          ? <div className="text-center py-12 text-slate-400 text-sm">No categories yet</div>
          : <div className="space-y-2">
              {categories.map((c: any) => (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 flex items-center justify-center">
                    {c.image_url
                      ? <img src={c.image_url} alt="" className="w-full h-full object-cover" />
                      : <Grid3X3 size={18} className="text-slate-300" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{c.slug}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => open(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"><Pencil size={15} /></button>
                    <button onClick={() => del(c.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-3xl">
              <h3 className="font-bold text-slate-900">{editing ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <input value={form.name}
                onChange={e => { set('name', e.target.value); if (!editing) set('slug', autoSlug(e.target.value)) }}
                placeholder="Category Name *"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
              <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="Slug (auto-generated)"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 font-mono" />
              <input value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value)||0)}
                placeholder="Sort Order (0, 1, 2...)" type="number"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
                <span className="text-sm text-slate-600">Active</span>
              </label>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Image</p>
                <ImageUpload value={image} onChange={setImage} max={1} folder="categories" />
              </div>
              <div className="flex gap-2 pb-4">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 text-sm">Cancel</button>
                <button onClick={save} disabled={saving || !form.name}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? 'Saving...' : <><Check size={15} /> Save</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
