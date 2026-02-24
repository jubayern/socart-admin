'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Tag, X, Check } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'
import { toast } from '../../lib/toast'

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
    try {
      await api.post('/api/admin/coupons', { code:form.code.toUpperCase(), discount_type:form.discount_type, discount_value:+form.discount_value, min_order:+(form.min_order||0), max_uses:+form.max_uses })
      toast.success('Coupon created!'); setOpen(false); setForm(EMPTY); load()
    } catch { toast.error('Failed to create coupon') }
    setSaving(false)
  }

  const del = async (id: string, code: string) => {
    if (!confirm(`Delete coupon ${code}?`)) return
    try { await api.delete(`/api/admin/coupons/${id}`); toast.success('Coupon deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  const sf = (k: string, v: any) => setForm((f: any) => ({...f,[k]:v}))
  const iS: React.CSSProperties = { background:'var(--s2)', border:'1.5px solid var(--bdr2)', borderRadius:12, padding:'12px 14px', fontSize:14, color:'var(--txt)', width:'100%' }

  return (
    <Shell>
      <div className="anim-fadeup" style={{ padding:'14px' }}>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
          <button onClick={() => setOpen(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', cursor:'pointer', color:'white', fontSize:13, fontWeight:700, boxShadow:'0 4px 16px rgba(124,58,237,.35)' }}>
            <Plus size={15}/> New Coupon
          </button>
        </div>

        {coupons.length === 0 ? (
          <p style={{ textAlign:'center', paddingTop:60, color:'var(--txt2)', fontSize:14 }}>No coupons yet</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {coupons.map((c: any) => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px', background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18 }}>
                <div style={{ width:42, height:42, borderRadius:12, flexShrink:0, background:'var(--accent-lt)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Tag size={18} color="var(--accent-text)" />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:800, fontSize:14, color:'var(--txt)', fontFamily:'monospace', letterSpacing:'0.05em' }}>{c.code}</p>
                  <p style={{ fontSize:13, fontWeight:700, color:'var(--accent-text)', marginTop:2 }}>
                    {c.discount_type==='fixed' ? `৳${c.discount_value}` : `${c.discount_value}%`} OFF
                    {c.min_order>0 && <span style={{ fontSize:11, fontWeight:400, color:'var(--txt3)', marginLeft:6 }}>min ৳{c.min_order}</span>}
                  </p>
                  <p style={{ fontSize:11, color:'var(--txt3)', marginTop:2 }}>Used {c.used_count}/{c.max_uses}</p>
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99, background: c.is_active?'var(--green-lt)':'var(--s3)', color: c.is_active?'var(--green)':'var(--txt3)' }}>
                    {c.is_active ? 'Active' : 'Off'}
                  </span>
                  <button onClick={() => del(c.id, c.code)} style={{ width:32, height:32, borderRadius:9, background:'var(--red-lt)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    <Trash2 size={13} color="var(--red)" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.65)', backdropFilter:'blur(4px)' }} onClick={() => setOpen(false)} />
          <div className="anim-slideup" style={{ position:'relative', width:'100%', background:'var(--s1)', borderRadius:'22px 22px 0 0', border:'1px solid var(--bdr2)', borderBottom:'none' }}>
            <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 4px' }}><div style={{ width:36, height:3, borderRadius:99, background:'var(--s4)' }} /></div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 18px 12px', borderBottom:'1px solid var(--bdr)' }}>
              <p style={{ fontWeight:800, fontSize:15, color:'var(--txt)' }}>New Coupon</p>
              <button onClick={() => setOpen(false)} style={{ width:30, height:30, borderRadius:8, background:'var(--s3)', border:'1px solid var(--bdr)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={14} color="var(--txt2)" /></button>
            </div>
            <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:10 }}>
              <input value={form.code} onChange={e => sf('code', e.target.value.toUpperCase())} placeholder="COUPON CODE *" style={{ ...iS, fontFamily:'monospace', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase' }} />
              <select value={form.discount_type} onChange={e => sf('discount_type', e.target.value)} style={iS}>
                <option value="fixed">Fixed Amount (৳)</option>
                <option value="percent">Percentage (%)</option>
              </select>
              <input value={form.discount_value} onChange={e => sf('discount_value', e.target.value)} type="number" placeholder="Discount value *" style={iS} />
              <input value={form.min_order} onChange={e => sf('min_order', e.target.value)} type="number" placeholder="Min order amount (optional)" style={iS} />
              <input value={form.max_uses} onChange={e => sf('max_uses', e.target.value)} type="number" placeholder="Max uses" style={iS} />
              <div style={{ display:'flex', gap:10, paddingBottom:24 }}>
                <button onClick={() => setOpen(false)} style={{ flex:1, padding:'13px', borderRadius:12, background:'var(--s3)', border:'1px solid var(--bdr2)', color:'var(--txt2)', fontWeight:600, fontSize:14, cursor:'pointer' }}>Cancel</button>
                <button onClick={save} disabled={saving||!form.code||!form.discount_value} style={{ flex:1, padding:'13px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:14, color:'white', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:(!form.code||!form.discount_value)?0.5:1 }}>
                  {saving ? 'Creating...' : <><Check size={15}/>Create</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
