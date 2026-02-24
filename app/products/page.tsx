'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Package, X, Check, PlusCircle, Minus } from 'lucide-react'
import Shell from '../../components/Shell'
import ImageUpload from '../../components/ImageUpload'
import { api, getToken } from '../../lib/api'
import { toast } from '../../lib/toast'

const EMPTY = { name:'', description:'', price:'', old_price:'', stock:'0', category_id:'', is_active:true, is_featured:false }
type V = { id?: string; name: string; options: string[] }

// Shared input style
const inp: React.CSSProperties = { marginBottom:0 }
const row: React.CSSProperties = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts]     = useState<any[]>([])
  const [cats, setCats]             = useState<any[]>([])
  const [open, setOpen]             = useState(false)
  const [editing, setEditing]       = useState<any>(null)
  const [form, setForm]             = useState<any>(EMPTY)
  const [images, setImages]         = useState<string[]>([])
  const [variants, setVariants]     = useState<V[]>([])
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
    setProducts(p); setCats(c); setLoading(false)
  }

  const openForm = async (p?: any) => {
    if (p) {
      setEditing(p)
      setForm({ name:p.name, description:p.description||'', price:p.price, old_price:p.old_price||'',
        stock:p.stock, category_id:p.category_id||'', is_active:p.is_active, is_featured:p.is_featured })
      setImages(p.images||[])
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
    try {
      const body = { ...form, price:+form.price, old_price:form.old_price?+form.old_price:null, stock:+form.stock, category_id:form.category_id||null, images }
      let pid = editing?.id
      if (editing) {
        await api.put(`/api/products/${editing.id}`, body)
        toast.success('Product updated!')
      } else {
        const r = await api.post('/api/products', body)
        pid = r.data.id
        toast.success('Product created!')
      }
      if (pid) {
        for (const v of variants) {
          const opts = v.options.filter(o => o.trim())
          if (!v.name.trim() || !opts.length) continue
          const vb = { product_id:pid, name:v.name, options:opts }
          if (v.id) await api.put(`/api/variants/${v.id}`, vb).catch(()=>{})
          else      await api.post('/api/variants', vb).catch(()=>{})
        }
      }
      setOpen(false); load()
    } catch { toast.error('Failed to save product') }
    setSaving(false)
  }

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await api.delete(`/api/products/${id}`)
      toast.success('Product deleted')
      load()
    } catch { toast.error('Failed to delete') }
  }

  const sf = (k: string, v: any) => setForm((f: any) => ({...f,[k]:v}))

  // Variant helpers
  const addV  = () => setVariants(v => [...v, { name:'', options:[''] }])
  const delV  = (i: number) => setVariants(v => v.filter((_,x) => x!==i))
  const setVN = (i: number, n: string) => setVariants(v => v.map((x,xi) => xi===i?{...x,name:n}:x))
  const addO  = (i: number) => setVariants(v => v.map((x,xi) => xi===i?{...x,options:[...x.options,'']}:x))
  const delO  = (vi: number, oi: number) => setVariants(v => v.map((x,xi) => xi===vi?{...x,options:x.options.filter((_,j)=>j!==oi)}:x))
  const setO  = (vi: number, oi: number, val: string) =>
    setVariants(v => v.map((x,xi) => xi===vi?{...x,options:x.options.map((o,j)=>j===oi?val:o)}:x))

  const label: React.CSSProperties = { fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--txt3)', marginBottom:8, display:'block' }
  const iStyle: React.CSSProperties = { background:'var(--s2)', border:'1.5px solid var(--bdr2)', borderRadius:12, padding:'12px 14px', fontSize:14, color:'var(--txt)', width:'100%' }

  return (
    <Shell>
      <div className="anim-fadeup" style={{ padding:'14px 14px' }}>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
          <button onClick={() => openForm()} style={{
            display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:12,
            background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', cursor:'pointer',
            color:'white', fontSize:13, fontWeight:700,
            boxShadow:'0 4px 16px rgba(124,58,237,.35)',
          }}>
            <Plus size={15} /> Add Product
          </button>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid var(--accent-lt)', borderTopColor:'var(--accent)', animation:'spin 1s linear infinite' }} />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:60 }}>
            <div style={{ width:56, height:56, borderRadius:18, background:'var(--accent-lt)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
              <Package size={26} color="var(--accent-text)" />
            </div>
            <p style={{ fontWeight:700, color:'var(--txt)', marginBottom:4 }}>No products yet</p>
            <p style={{ fontSize:13, color:'var(--txt2)' }}>Tap Add Product to get started</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {products.map((p: any) => (
              <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18 }}>
                <div style={{ width:56, height:56, borderRadius:14, overflow:'hidden', flexShrink:0, background:'var(--s3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {p.images?.[0] ? <img src={p.images[0]} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" /> : <Package size={20} color="var(--txt3)" />}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:13, color:'var(--txt)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                    <span style={{ fontWeight:700, fontSize:13, color:'var(--accent-text)' }}>৳{p.price}</span>
                    {p.old_price && <span style={{ fontSize:11, color:'var(--txt3)', textDecoration:'line-through' }}>৳{p.old_price}</span>}
                  </div>
                  <div style={{ display:'flex', gap:5, marginTop:5, flexWrap:'wrap' }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99, background: p.is_active ? 'var(--green-lt)' : 'var(--s3)', color: p.is_active ? 'var(--green)' : 'var(--txt3)' }}>
                      {p.is_active ? 'Active' : 'Off'}
                    </span>
                    <span style={{ fontSize:10, color:'var(--txt3)', padding:'2px 0' }}>Stock: {p.stock}</span>
                    {p.is_featured && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99, background:'var(--amber-lt)', color:'var(--amber)' }}>★ Featured</span>}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  <button onClick={() => openForm(p)} style={{ width:34, height:34, borderRadius:10, background:'var(--accent-lt)', border:'1px solid rgba(124,58,237,.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    <Pencil size={14} color="var(--accent-text)" />
                  </button>
                  <button onClick={() => del(p.id, p.name)} style={{ width:34, height:34, borderRadius:10, background:'var(--red-lt)', border:'1px solid rgba(239,68,68,.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    <Trash2 size={14} color="var(--red)" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sheet */}
      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.65)', backdropFilter:'blur(4px)' }} onClick={() => setOpen(false)} />
          <div className="anim-slideup" style={{ position:'relative', width:'100%', maxHeight:'93vh', display:'flex', flexDirection:'column', background:'var(--s1)', borderRadius:'22px 22px 0 0', border:'1px solid var(--bdr2)', borderBottom:'none' }}>
            <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 4px' }}>
              <div style={{ width:36, height:3, borderRadius:99, background:'var(--s4)' }} />
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 18px 12px', borderBottom:'1px solid var(--bdr)' }}>
              <p style={{ fontWeight:800, fontSize:15, color:'var(--txt)' }}>{editing ? 'Edit Product' : 'New Product'}</p>
              <button onClick={() => setOpen(false)} style={{ width:30, height:30, borderRadius:8, background:'var(--s3)', border:'1px solid var(--bdr)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <X size={14} color="var(--txt2)" />
              </button>
            </div>

            <div style={{ overflowY:'auto', flex:1, padding:'16px 18px', display:'flex', flexDirection:'column', gap:16 }}>

              {/* Basic */}
              <div>
                <span style={label}>Basic Info</span>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <input value={form.name} onChange={e => sf('name', e.target.value)} placeholder="Product Name *" style={iStyle} />
                  <textarea value={form.description} onChange={e => sf('description', e.target.value)} placeholder="Description" rows={3} style={{ ...iStyle, resize:'none' }} />
                  <div style={row}>
                    <input value={form.price} onChange={e => sf('price', e.target.value)} type="number" placeholder="Price *" style={iStyle} />
                    <input value={form.old_price} onChange={e => sf('old_price', e.target.value)} type="number" placeholder="Old Price" style={iStyle} />
                  </div>
                  <div style={row}>
                    <input value={form.stock} onChange={e => sf('stock', e.target.value)} type="number" placeholder="Stock" style={iStyle} />
                    <select value={form.category_id} onChange={e => sf('category_id', e.target.value)} style={iStyle}>
                      <option value="">No Category</option>
                      {cats.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display:'flex', gap:20, paddingTop:4 }}>
                    {[['is_active','Active'],['is_featured','★ Featured']].map(([k,l]) => (
                      <label key={k} style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer', fontSize:13, fontWeight:600, color:'var(--txt2)' }}>
                        <input type="checkbox" checked={form[k]} onChange={e => sf(k, e.target.checked)} />
                        {l}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <span style={label}>Images</span>
                <ImageUpload value={images} onChange={setImages} folder="products" />
              </div>

              {/* Variants */}
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                  <span style={label}>Variants</span>
                  <button onClick={addV} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:'var(--accent-text)', fontSize:12, fontWeight:700 }}>
                    <PlusCircle size={13} /> Add
                  </button>
                </div>
                {variants.length === 0 && (
                  <p style={{ fontSize:12, color:'var(--txt3)', background:'var(--s2)', padding:'10px 14px', borderRadius:10 }}>
                    No variants. Example: Size → S, M, L · Color → Red, Blue
                  </p>
                )}
                {variants.map((v, vi) => (
                  <div key={vi} style={{ background:'var(--s2)', borderRadius:14, padding:12, marginBottom:8, border:'1px solid var(--bdr)' }}>
                    <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                      <input value={v.name} onChange={e => setVN(vi, e.target.value)} placeholder="Name (Size / Color)" style={{ ...iStyle, borderRadius:10, padding:'10px 12px' }} />
                      <button onClick={() => delV(vi)} style={{ width:38, height:38, borderRadius:10, flexShrink:0, background:'var(--red-lt)', border:'1px solid rgba(239,68,68,.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                        <X size={13} color="var(--red)" />
                      </button>
                    </div>
                    {v.options.map((opt, oi) => (
                      <div key={oi} style={{ display:'flex', gap:7, marginBottom:6 }}>
                        <input value={opt} onChange={e => setO(vi, oi, e.target.value)} placeholder={`Option ${oi+1}`} style={{ ...iStyle, borderRadius:10, padding:'9px 12px' }} />
                        {v.options.length > 1 && (
                          <button onClick={() => delO(vi, oi)} style={{ width:34, height:34, borderRadius:8, flexShrink:0, background:'var(--s3)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                            <Minus size={12} color="var(--txt2)" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addO(vi)} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:'var(--accent-text)', fontSize:12, fontWeight:600, marginTop:4 }}>
                      <Plus size={11} /> Add option
                    </button>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div style={{ display:'flex', gap:10, paddingBottom:24 }}>
                <button onClick={() => setOpen(false)} style={{ flex:1, padding:'13px', borderRadius:12, background:'var(--s3)', border:'1px solid var(--bdr2)', color:'var(--txt2)', fontWeight:600, fontSize:14, cursor:'pointer' }}>
                  Cancel
                </button>
                <button onClick={save} disabled={saving || !form.name || !form.price} style={{
                  flex:1, padding:'13px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:14, color:'white',
                  background: saving ? 'var(--s3)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  opacity: (!form.name || !form.price) ? 0.5 : 1,
                }}>
                  {saving ? <><div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,.3)', borderTopColor:'white', animation:'spin 1s linear infinite' }} /> Saving...</> : <><Check size={15} /> Save</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
