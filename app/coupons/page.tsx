'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Tag, X, Check } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'

const EMPTY = { code:'', discount_type:'fixed', discount_value:'', min_order:'', max_uses:'100' }

export default function CouponsPage() {
  const router = useRouter()
  const [coupons, setCoupons] = useState<any[]>([])
  const [open, setOpen]       = useState(false)
  const [form, setForm]       = useState<any>(EMPTY)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (!getToken()) { router.replace('/'); return }
    load()
  }, [])

  const load = () => api.get('/api/admin/coupons').then(r => setCoupons(r.data)).catch(()=>{})

  const save = async () => {
    setSaving(true)
    await api.post('/api/admin/coupons', {
      code: form.code.toUpperCase(), discount_type: form.discount_type,
      discount_value: +form.discount_value, min_order: +(form.min_order||0), max_uses: +form.max_uses
    }).catch(()=>{})
    setSaving(false); setOpen(false); setForm(EMPTY); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete coupon?')) return
    await api.delete(`/api/admin/coupons/${id}`); load()
  }

  const sf = (k: string, v: any) => setForm((f: any) => ({...f,[k]:v}))

  return (
    <Shell title="Coupons">
      <div className="px-4 py-4">
        <div className="flex justify-end mb-4">
          <button onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white"
            style={{ background:'var(--brand)' }}>
            <Plus size={16}/> New Coupon
          </button>
        </div>
        {coupons.length === 0 ? (
          <p className="text-center py-16 text-sm" style={{ color:'var(--muted)' }}>No coupons yet</p>
        ) : (
          <div className="space-y-2.5">
            {coupons.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 p-4 rounded-3xl shadow-sm" style={{ background:'var(--card)' }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background:'var(--brand-light)' }}>
                  <Tag size={18} style={{ color:'var(--brand)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold tracking-widest" style={{ color:'var(--text)' }}>{c.code}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color:'var(--brand)' }}>
                    {c.discount_type==='fixed' ? `৳${c.discount_value}` : `${c.discount_value}%`} OFF
                    {c.min_order > 0 && <span className="text-xs font-normal ml-1" style={{ color:'var(--muted)' }}>min ৳{c.min_order}</span>}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color:'var(--muted)' }}>Used {c.used_count}/{c.max_uses}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: c.is_active ? '#dcfce7' : '#f3f4f6', color: c.is_active ? '#15803d' : '#6b7280' }}>
                    {c.is_active ? 'Active' : 'Off'}
                  </span>
                  <button onClick={() => del(c.id)} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'#fee2e2', color:'#ef4444' }}>
                    <Trash2 size={15}/>
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
          <div className="relative rounded-t-3xl" style={{ background:'var(--card)' }}>
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full" style={{ background:'var(--border)' }}/></div>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom:'1px solid var(--border)' }}>
              <p className="font-bold" style={{ color:'var(--text)' }}>New Coupon</p>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'var(--bg)' }}>
                <X size={16} style={{ color:'var(--muted)' }}/>
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <input value={form.code} onChange={e => sf('code', e.target.value.toUpperCase())} placeholder="COUPON CODE *"
                className="w-full px-4 py-3 rounded-2xl text-sm font-mono font-bold uppercase tracking-widest outline-none"
                style={{ background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)' }}/>
              <select value={form.discount_type} onChange={e => sf('discount_type', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none"
                style={{ background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)' }}>
                <option value="fixed">Fixed Amount (৳)</option>
                <option value="percent">Percentage (%)</option>
              </select>
              <input value={form.discount_value} onChange={e => sf('discount_value', e.target.value)} type="number" placeholder="Discount value *"
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)' }}/>
              <input value={form.min_order} onChange={e => sf('min_order', e.target.value)} type="number" placeholder="Min order (optional)"
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)' }}/>
              <input value={form.max_uses} onChange={e => sf('max_uses', e.target.value)} type="number" placeholder="Max uses"
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                style={{ background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)' }}/>
              <div className="flex gap-2 pb-6">
                <button onClick={() => setOpen(false)} className="flex-1 py-3.5 rounded-2xl text-sm font-bold"
                  style={{ background:'var(--bg)', color:'var(--muted)', border:'1.5px solid var(--border)' }}>Cancel</button>
                <button onClick={save} disabled={saving||!form.code||!form.discount_value}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background:'var(--brand)' }}>
                  {saving?'Saving...':<><Check size={16}/>Create</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
