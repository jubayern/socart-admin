'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Package, X, Check, PlusCircle, MinusCircle } from 'lucide-react'
import Layout from '../../components/Layout'
import ImageUpload from '../../components/ImageUpload'
import { api, getToken } from '../../lib/api'

const EMPTY = { name:'', description:'', price:'', old_price:'', stock:'', category_id:'', is_active:true, is_featured:false }
type Variant = { id?: string; name: string; options: string[] }

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts]     = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<any>(null)
  const [form, setForm]             = useState<any>(EMPTY)
  const [images, setImages]         = useState<string[]>([])
  const [variants, setVariants]     = useState<Variant[]>([])
  const [saving, setSaving]         = useState(false)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!getToken()) { router.push('/'); return }
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const [p, c] = await Promise.all([
      api.get('/api/products/all').then(r => r.data).catch(() => []),
      api.get('/api/categories').then(r => r.data).catch(() => []),
    ])
    setProducts(p)
    setCategories(c)
    setLoading(false)
  }

  const open = async (product?: any) => {
    if (product) {
      setEditing(product)
      setForm({ name: product.name, description: product.description||'', price: product.price,
        old_price: product.old_price||'', stock: product.stock, category_id: product.category_id||'',
        is_active: product.is_active, is_featured: product.is_featured })
      setImages(product.images || [])
      const v = await api.get(`/api/variants/${product.id}`).then(r => r.data).catch(() => [])
      setVariants(v.map((x: any) => ({ id: x.id, name: x.name, options: x.options })))
    } else {
      setEditing(null); setForm(EMPTY); setImages([]); setVariants([])
    }
    setShowForm(true)
  }

  const addVariant = () => setVariants(v => [...v, { name: '', options: [''] }])
  const removeVariant = (i: number) => setVariants(v => v.filter((_,idx) => idx !== i))
  const setVName = (i: number, name: string) => setVariants(v => v.map((x,idx) => idx===i?{...x,name}:x))
  const addOpt   = (i: number) => setVariants(v => v.map((x,idx) => idx===i?{...x,options:[...x.options,'']}:x))
  const setOpt   = (vi: number, oi: number, val: string) =>
    setVariants(v => v.map((x,idx) => idx===vi?{...x,options:x.options.map((o,oidx)=>oidx===oi?val:o)}:x))
  const removeOpt = (vi: number, oi: number) =>
    setVariants(v => v.map((x,idx) => idx===vi?{...x,options:x.options.filter((_,oidx)=>oidx!==oi)}:x))

  const save = async () => {
    if (!form.name || !form.price) return
    setSaving(true)
    const payload = { ...form, price: parseFloat(form.price),
      old_price: form.old_price ? parseFloat(form.old_price) : null,
      stock: parseInt(form.stock||'0'), category_id: form.category_id||null, images }
    let pid = editing?.id
    if (editing) {
      await api.put(`/api/products/${editing.id}`, payload)
    } else {
      const r = await api.post('/api/products', payload)
      pid = r.data.id
    }
    if (pid) {
      for (const v of variants) {
        const opts = v.options.filter(o => o.trim())
        if (!v.name.trim() || opts.length === 0) continue
        const cleaned = { product_id: pid, name: v.name, options: opts }
        if (v.id) await api.put(`/api/variants/${v.id}`, cleaned).catch(() => {})
        else      await api.post('/api/variants', cleaned).catch(() => {})
      }
    }
    setSaving(false); setShowForm(false); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/api/products/${id}`); load()
  }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  return (
    <Layout>
      <div className="px-4 py-4">
        <div className="flex justify-end mb-3">
          <button onClick={() => open()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
            <Plus size={15} /> Add Product
          </button>
        </div>

        {loading
          ? <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          : products.length === 0
            ? <div className="text-center py-12 text-slate-400 text-sm">No products yet</div>
            : <div className="space-y-2">
                {products.map((p: any) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 flex items-center justify-center">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        : <Package size={20} className="text-slate-300" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{p.name}</p>
                      <p className="text-blue-600 font-bold text-sm">৳{p.price}
                        {p.old_price && <span className="text-slate-400 text-xs font-normal line-through ml-1">৳{p.old_price}</span>}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Stock: {p.stock}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {p.is_featured && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700">Featured</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button onClick={() => open(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"><Pencil size={15} /></button>
                      <button onClick={() => del(p.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>
        }
      </div>

      {/* Form — bottom sheet */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[95vh] overflow-auto">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-3xl">
              <h3 className="font-bold text-slate-900">{editing ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Basic Info */}
              <div className="space-y-3">
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Product Name *"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Description" rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={form.price} onChange={e => set('price', e.target.value)} placeholder="Price *" type="number"
                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  <input value={form.old_price} onChange={e => set('old_price', e.target.value)} placeholder="Old Price" type="number"
                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="Stock" type="number"
                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                  <select value={form.category_id} onChange={e => set('category_id', e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400">
                    <option value="">No Category</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
                    <span className="text-sm text-slate-600">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} />
                    <span className="text-sm text-slate-600">Featured</span>
                  </label>
                </div>
              </div>

              {/* Images */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Images</p>
                <ImageUpload value={images} onChange={setImages} folder="products" />
              </div>

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Variants</p>
                  <button onClick={addVariant} className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                    <PlusCircle size={13} /> Add
                  </button>
                </div>
                {variants.length === 0
                  ? <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3">No variants. Add Size, Color, etc.</p>
                  : variants.map((v, vi) => (
                    <div key={vi} className="bg-slate-50 rounded-xl p-3 mb-2 space-y-2">
                      <div className="flex gap-2">
                        <input value={v.name} onChange={e => setVName(vi, e.target.value)}
                          placeholder="e.g. Size, Color"
                          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white" />
                        <button onClick={() => removeVariant(vi)} className="p-2 text-rose-400"><X size={15} /></button>
                      </div>
                      <div className="space-y-1.5">
                        {v.options.map((opt, oi) => (
                          <div key={oi} className="flex gap-2">
                            <input value={opt} onChange={e => setOpt(vi, oi, e.target.value)}
                              placeholder={`Option ${oi+1} (e.g. S, M, L)`}
                              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none bg-white" />
                            {v.options.length > 1 && (
                              <button onClick={() => removeOpt(vi, oi)} className="text-slate-400"><MinusCircle size={15} /></button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => addOpt(vi)} className="text-xs text-blue-600 font-medium flex items-center gap-1">
                          <Plus size={11} /> Add option
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>

              <div className="flex gap-2 pb-4">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium">Cancel</button>
                <button onClick={save} disabled={saving || !form.name || !form.price}
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
