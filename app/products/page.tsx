'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Package, X, Check, PlusCircle, Minus } from 'lucide-react'
import Shell from '../../components/Shell'
import ImageUpload from '../../components/ImageUpload'
import { api, getToken } from '../../lib/api'

const EMPTY = { name:'', description:'', price:'', old_price:'', stock:'0', category_id:'', is_active:true, is_featured:false }
type Variant = { id?: string; name: string; options: string[] }

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts]     = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [open, setOpen]             = useState(false)
  const [editing, setEditing]       = useState<any>(null)
  const [form, setForm]             = useState<any>(EMPTY)
  const [images, setImages]         = useState<string[]>([])
  const [variants, setVariants]     = useState<Variant[]>([])
  const [saving, setSaving]         = useState(false)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!getToken()) { router.replace('/'); return }
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const [p, c] = await Promise.all([
      api.get('/api/products/admin/list').then(r => r.data).catch(() => []),
      api.get('/api/categories/all').then(r => r.data).catch(() => []),
    ])
    setProducts(p); setCategories(c); setLoading(false)
  }

  const openForm = async (p?: any) => {
    if (p) {
      setEditing(p)
      setForm({ name: p.name, description: p.description||'', price: p.price, old_price: p.old_price||'',
        stock: p.stock, category_id: p.category_id||'', is_active: p.is_active, is_featured: p.is_featured })
      setImages(p.images || [])
      const v = await api.get(`/api/variants/${p.id}`).then(r => r.data).catch(() => [])
      setVariants(v)
    } else {
      setEditing(null); setForm(EMPTY); setImages([]); setVariants([])
    }
    setOpen(true)
  }

  const save = async () => {
    if (!form.name || !form.price) return
    setSaving(true)
    const body = { ...form, price: +form.price, old_price: form.old_price ? +form.old_price : null,
      stock: +form.stock, category_id: form.category_id || null, images }
    let pid = editing?.id
    if (editing) await api.put(`/api/products/${editing.id}`, body)
    else { const r = await api.post('/api/products', body); pid = r.data.id }
    if (pid) {
      for (const v of variants) {
        const opts = v.options.filter(o => o.trim())
        if (!v.name.trim() || !opts.length) continue
        const vb = { product_id: pid, name: v.name, options: opts }
        if (v.id) await api.put(`/api/variants/${v.id}`, vb).catch(() => {})
        else      await api.post('/api/variants', vb).catch(() => {})
      }
    }
    setSaving(false); setOpen(false); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete product?')) return
    await api.delete(`/api/products/${id}`); load()
  }

  const sf = (k: string, v: any) => setForm((f: any) => ({...f, [k]: v}))

  // Variant helpers
  const addVar    = () => setVariants(v => [...v, { name: '', options: [''] }])
  const delVar    = (i: number) => setVariants(v => v.filter((_,idx) => idx !== i))
  const setVN     = (i: number, n: string) => setVariants(v => v.map((x,idx) => idx===i ? {...x,name:n} : x))
  const addOpt    = (i: number) => setVariants(v => v.map((x,idx) => idx===i ? {...x,options:[...x.options,'']} : x))
  const delOpt    = (vi: number, oi: number) => setVariants(v => v.map((x,idx) => idx===vi ? {...x,options:x.options.filter((_,j)=>j!==oi)} : x))
  const setOpt    = (vi: number, oi: number, val: string) =>
    setVariants(v => v.map((x,idx) => idx===vi ? {...x,options:x.options.map((o,j)=>j===oi?val:o)} : x))

  return (
    <Shell title="Products">
      <div className="px-4 py-4">
        <div className="flex justify-end mb-4">
          <button onClick={() => openForm()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white shadow-sm"
            style={{ background: 'var(--brand)' }}>
            <Plus size={16} /> Add Product
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor:'var(--brand-light)', borderTopColor:'var(--brand)' }} />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background:'var(--brand-light)' }}>
              <Package size={28} style={{ color:'var(--brand)' }} />
            </div>
            <p className="font-bold" style={{ color:'var(--text)' }}>No products yet</p>
            <p className="text-sm" style={{ color:'var(--muted)' }}>Tap Add Product to get started</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {products.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-3xl shadow-sm" style={{ background:'var(--card)' }}>
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background:'var(--bg)' }}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} className="w-full h-full object-cover" alt="" />
                    : <Package size={22} style={{ color:'var(--border)' }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color:'var(--text)' }}>{p.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-bold text-sm" style={{ color:'var(--brand)' }}>৳{p.price}</span>
                    {p.old_price && <span className="text-xs line-through" style={{ color:'var(--muted)' }}>৳{p.old_price}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: p.is_active ? '#dcfce7' : '#f3f4f6', color: p.is_active ? '#15803d' : '#6b7280' }}>
                      {p.is_active ? 'Active' : 'Off'}
                    </span>
                    <span className="text-[10px]" style={{ color:'var(--muted)' }}>Stock: {p.stock}</span>
                    {p.is_featured && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background:'#fef3c7', color:'#92400e' }}>Featured</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => openForm(p)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'var(--brand-light)', color:'var(--brand)' }}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => del(p.id)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'#fee2e2', color:'#ef4444' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom sheet form */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative rounded-t-3xl overflow-hidden flex flex-col" style={{ background:'var(--card)', maxHeight:'94vh' }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background:'var(--border)' }} />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom:'1px solid var(--border)' }}>
              <p className="font-bold" style={{ color:'var(--text)' }}>{editing ? 'Edit Product' : 'New Product'}</p>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'var(--bg)' }}>
                <X size={16} style={{ color:'var(--muted)' }} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-auto flex-1 px-5 py-4 space-y-5">

              {/* Basic */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wide" style={{ color:'var(--muted)' }}>Basic Info</label>
                <input value={form.name} onChange={e => sf('name', e.target.value)} placeholder="Product Name *"
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none"
                  style={{ background:'var(--bg)', color:'var(--text)', border:'1.5px solid var(--border)' }} />
                <textarea value={form.description} onChange={e => sf('description', e.target.value)} placeholder="Description" rows={3}
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none"
                  style={{ background:'var(--bg)', color:'var(--text)', border:'1.5px solid var(--border)' }} />
                <div className="grid grid-cols-2 gap-2">
                  <input value={form.price} onChange={e => sf('price', e.target.value)} placeholder="Price *" type="number"
                    className="px-4 py-3 rounded-2xl text-sm font-medium outline-none"
                    style={{ background:'var(--bg)', color:'var(--text)', border:'1.5px solid var(--border)' }} />
                  <input value={form.old_price} onChange={e => sf('old_price', e.target.value)} placeholder="Old Price" type="number"
                    className="px-4 py-3 rounded-2xl text-sm outline-none"
                    style={{ background:'var(--bg)', color:'var(--text)', border:'1.5px solid var(--border)' }} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={form.stock} onChange={e => sf('stock', e.target.value)} placeholder="Stock" type="number"
                    className="px-4 py-3 rounded-2xl text-sm outline-none"
                    style={{ background:'var(--bg)', color:'var(--text)', border:'1.5px solid var(--border)' }} />
                  <select value={form.category_id} onChange={e => sf('category_id', e.target.value)}
                    className="px-4 py-3 rounded-2xl text-sm outline-none"
                    style={{ background:'var(--bg)', color:'var(--text)', border:'1.5px solid var(--border)' }}>
                    <option value="">No Category</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-5">
                  {[['is_active','Active'],['is_featured','Featured']].map(([k,l]) => (
                    <label key={k} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form[k]} onChange={e => sf(k, e.target.checked)} className="w-4 h-4 rounded" />
                      <span className="text-sm font-medium" style={{ color:'var(--text)' }}>{l}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wide" style={{ color:'var(--muted)' }}>Images</label>
                <ImageUpload value={images} onChange={setImages} folder="products" />
              </div>

              {/* Variants */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wide" style={{ color:'var(--muted)' }}>Variants</label>
                  <button onClick={addVar} className="flex items-center gap-1 text-xs font-bold" style={{ color:'var(--brand)' }}>
                    <PlusCircle size={14} /> Add Variant
                  </button>
                </div>
                {variants.length === 0 && (
                  <p className="text-xs px-4 py-3 rounded-2xl" style={{ background:'var(--bg)', color:'var(--muted)' }}>
                    No variants. Example: Size → S, M, L · Color → Red, Blue
                  </p>
                )}
                {variants.map((v, vi) => (
                  <div key={vi} className="rounded-2xl p-3 space-y-2" style={{ background:'var(--bg)', border:'1.5px solid var(--border)' }}>
                    <div className="flex items-center gap-2">
                      <input value={v.name} onChange={e => setVN(vi, e.target.value)} placeholder="Name (e.g. Size, Color)"
                        className="flex-1 px-3 py-2 rounded-xl text-sm font-medium outline-none"
                        style={{ background:'var(--card)', color:'var(--text)', border:'1.5px solid var(--border)' }} />
                      <button onClick={() => delVar(vi)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'#fee2e2', color:'#ef4444' }}>
                        <X size={14} />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {v.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input value={opt} onChange={e => setOpt(vi, oi, e.target.value)} placeholder={`Option ${oi+1}`}
                            className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                            style={{ background:'var(--card)', color:'var(--text)', border:'1.5px solid var(--border)' }} />
                          {v.options.length > 1 && (
                            <button onClick={() => delOpt(vi, oi)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color:'var(--muted)' }}>
                              <Minus size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addOpt(vi)} className="text-xs font-bold flex items-center gap-1 mt-1" style={{ color:'var(--brand)' }}>
                        <Plus size={11} /> Add Option
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save */}
              <div className="flex gap-2 pb-6">
                <button onClick={() => setOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold"
                  style={{ background:'var(--bg)', color:'var(--muted)', border:'1.5px solid var(--border)' }}>
                  Cancel
                </button>
                <button onClick={save} disabled={saving || !form.name || !form.price}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background:'var(--brand)' }}>
                  {saving ? 'Saving...' : <><Check size={16} /> Save Product</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
