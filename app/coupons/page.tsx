'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X, Check } from 'lucide-react'
import Layout from '../../components/Layout'
import { api, getToken } from '../../lib/api'

const EMPTY = { code: '', discount_type: 'fixed', discount_value: '', min_order: '', max_uses: '100' }

export default function CouponsPage() {
  const router = useRouter()
  const [coupons, setCoupons]   = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState<any>(EMPTY)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    if (!getToken()) { router.push('/'); return }
    load()
  }, [])

  const load = () => api.get('/api/admin/coupons').then(r => setCoupons(r.data)).catch(() => {})

  const save = async () => {
    setSaving(true)
    await api.post('/api/admin/coupons', {
      code: form.code.toUpperCase(), discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order: parseFloat(form.min_order||'0'), max_uses: parseInt(form.max_uses),
    }).catch(() => {})
    setSaving(false); setShowForm(false); setForm(EMPTY); load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete coupon?')) return
    await api.delete(`/api/admin/coupons/${id}`); load()
  }

  return (
    <Layout>
      <div className="px-4 py-4">
        <div className="flex justify-end mb-3">
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
            <Plus size={15} /> Add Coupon
          </button>
        </div>

        {coupons.length === 0
          ? <div className="text-center py-12 text-slate-400 text-sm">No coupons yet</div>
          : <div className="space-y-2">
              {coupons.map((c: any) => (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-mono font-bold text-slate-800 tracking-widest">{c.code}</p>
                    <p className="text-sm text-blue-600 font-semibold">
                      {c.discount_type === 'fixed' ? `৳${c.discount_value}` : `${c.discount_value}%`} off
                      {c.min_order > 0 && <span className="text-xs text-slate-400 font-normal"> · min ৳{c.min_order}</span>}
                    </p>
                    <p className="text-xs text-slate-400">Used: {c.used_count}/{c.max_uses}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {c.is_active ? 'Active' : 'Off'}
                    </span>
                    <button onClick={() => del(c.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-3xl">
              <h3 className="font-bold text-slate-900">New Coupon</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <input value={form.code} onChange={e => setForm((f: any) => ({...f, code: e.target.value.toUpperCase()}))}
                placeholder="Coupon Code *" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none font-mono uppercase tracking-widest" />
              <select value={form.discount_type} onChange={e => setForm((f: any) => ({...f, discount_type: e.target.value}))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none">
                <option value="fixed">Fixed Amount (৳)</option>
                <option value="percent">Percentage (%)</option>
              </select>
              <input value={form.discount_value} onChange={e => setForm((f: any) => ({...f, discount_value: e.target.value}))}
                placeholder="Discount value *" type="number" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
              <input value={form.min_order} onChange={e => setForm((f: any) => ({...f, min_order: e.target.value}))}
                placeholder="Min order (optional)" type="number" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
              <input value={form.max_uses} onChange={e => setForm((f: any) => ({...f, max_uses: e.target.value}))}
                placeholder="Max uses" type="number" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none" />
              <div className="flex gap-2 pb-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 text-sm">Cancel</button>
                <button onClick={save} disabled={saving || !form.code || !form.discount_value}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                  {saving ? 'Saving...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
