'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Coins, X, Check, Zap } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'
import { toast } from '../../lib/toast'

const EMPTY = { title:'', description:'', type:'discount_coupon', coin_cost:100, value:10, is_active:true }

export default function CoinsPage() {
  const router = useRouter()
  const [rewards, setRewards]   = useState<any[]>([])
  const [double, setDouble]     = useState(false)
  const [open, setOpen]         = useState(false)
  const [form, setForm]         = useState<any>(EMPTY)
  const [saving, setSaving]     = useState(false)

  useEffect(() => { if (!getToken()) { router.replace('/'); return }; load() }, [])

  const load = async () => {
    const [r, s] = await Promise.all([
      api.get('/api/admin/coins/rewards').then(x => x.data).catch(()=>[]),
      api.get('/api/admin/settings').then(x => x.data).catch(()=>({})),
    ])
    setRewards(r)
    setDouble(s?.double_coin_active === 'true' || s?.double_coin_active === true)
  }

  const toggleDouble = async () => {
    const next = !double
    await api.put(`/api/admin/coins/double-event?active=${next}`).catch(()=>{})
    setDouble(next)
    toast.success(next ? '🎉 Double coin event ON!' : 'Double coin event off')
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.post('/api/admin/coins/rewards', form)
      toast.success('Reward created!'); setOpen(false); setForm(EMPTY); load()
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Delete reward?')) return
    await api.delete(`/api/admin/coins/rewards/${id}`)
    toast.success('Reward deleted'); load()
  }

  const sf = (k: string, v: any) => setForm((f:any) => ({...f,[k]:v}))
  const iS: React.CSSProperties = { background:'var(--s2)', border:'1.5px solid var(--bdr2)', borderRadius:12, padding:'12px 14px', fontSize:14, color:'var(--txt)', width:'100%' }

  return (
    <Shell>
      <div className="anim-fadeup" style={{ padding:14, display:'flex', flexDirection:'column', gap:14 }}>

        {/* Double coin event */}
        <div style={{ background:'var(--s1)', border:`1px solid ${double ? 'rgba(245,158,11,.3)' : 'var(--bdr)'}`, borderRadius:18, padding:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Zap size={22} color={double ? 'var(--amber)' : 'var(--txt3)'} />
              <div>
                <p style={{ fontWeight:700, fontSize:14, color:'var(--txt)' }}>Double Coin Event</p>
                <p style={{ fontSize:12, color:'var(--txt2)' }}>Users earn 2x coins on all orders</p>
              </div>
            </div>
            <button onClick={toggleDouble} style={{
              padding:'8px 18px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:13,
              background: double ? 'var(--amber-lt)' : 'var(--s3)',
              color: double ? 'var(--amber)' : 'var(--txt2)',
            }}>
              {double ? '✓ Active' : 'Activate'}
            </button>
          </div>
        </div>

        {/* Rewards */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <p style={{ fontWeight:700, fontSize:14, color:'var(--txt)' }}>Coin Rewards</p>
          <button onClick={() => setOpen(true)} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', cursor:'pointer', color:'white', fontSize:13, fontWeight:700 }}>
            <Plus size={14}/> Add
          </button>
        </div>

        {rewards.length === 0 ? (
          <p style={{ textAlign:'center', paddingTop:40, color:'var(--txt2)' }}>No rewards yet</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {rewards.map((r:any) => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px', background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18 }}>
                <div style={{ width:42, height:42, borderRadius:12, flexShrink:0, background:'var(--accent-lt)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:20 }}>{r.type==='free_delivery'?'🚚':r.type==='discount_coupon'?'🎟️':'💰'}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:13, color:'var(--txt)' }}>{r.title}</p>
                  <p style={{ fontSize:12, color:'var(--accent-text)', fontWeight:700, marginTop:2 }}>🪙 {r.coin_cost} coins</p>
                  {r.description && <p style={{ fontSize:11, color:'var(--txt3)', marginTop:1 }}>{r.description}</p>}
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99, background: r.is_active?'var(--green-lt)':'var(--s3)', color: r.is_active?'var(--green)':'var(--txt3)' }}>
                    {r.is_active ? 'Active' : 'Off'}
                  </span>
                  <button onClick={() => del(r.id)} style={{ width:30, height:30, borderRadius:8, background:'var(--red-lt)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    <Trash2 size={12} color="var(--red)" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.65)' }} onClick={() => setOpen(false)} />
          <div className="anim-slideup" style={{ position:'relative', width:'100%', background:'var(--s1)', borderRadius:'22px 22px 0 0', border:'1px solid var(--bdr2)', borderBottom:'none' }}>
            <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 4px' }}><div style={{ width:36, height:3, borderRadius:99, background:'var(--s4)' }} /></div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 18px 12px', borderBottom:'1px solid var(--bdr)' }}>
              <p style={{ fontWeight:800, fontSize:15, color:'var(--txt)' }}>New Reward</p>
              <button onClick={() => setOpen(false)} style={{ width:30, height:30, borderRadius:8, background:'var(--s3)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={14} color="var(--txt2)" /></button>
            </div>
            <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:10 }}>
              <input value={form.title} onChange={e => sf('title', e.target.value)} placeholder="Reward Title *" style={iS} />
              <input value={form.description} onChange={e => sf('description', e.target.value)} placeholder="Description" style={iS} />
              <select value={form.type} onChange={e => sf('type', e.target.value)} style={iS}>
                <option value="discount_coupon">Discount Coupon</option>
                <option value="free_delivery">Free Delivery</option>
              </select>
              <input value={form.coin_cost} type="number" onChange={e => sf('coin_cost', +e.target.value)} placeholder="Coin Cost" style={iS} />
              {form.type === 'discount_coupon' && (
                <input value={form.value} type="number" onChange={e => sf('value', +e.target.value)} placeholder="Discount %" style={iS} />
              )}
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, fontWeight:600, color:'var(--txt2)' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => sf('is_active', e.target.checked)} /> Active
              </label>
              <div style={{ display:'flex', gap:10, paddingBottom:24 }}>
                <button onClick={() => setOpen(false)} style={{ flex:1, padding:'13px', borderRadius:12, background:'var(--s3)', border:'1px solid var(--bdr2)', color:'var(--txt2)', fontWeight:600, fontSize:14, cursor:'pointer' }}>Cancel</button>
                <button onClick={save} disabled={saving||!form.title} style={{ flex:1, padding:'13px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:14, color:'white', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:!form.title?0.5:1 }}>
                  {saving ? 'Saving...' : <><Check size={15}/>Create</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
