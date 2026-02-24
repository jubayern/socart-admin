'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'
import { toast } from '../../lib/toast'

const STATUS_CFG: Record<string,any> = {
  pending:  { bg:'#fef3c7', c:'#d97706', label:'Pending'  },
  approved: { bg:'#dcfce7', c:'#16a34a', label:'Approved' },
  rejected: { bg:'#fee2e2', c:'#dc2626', label:'Rejected' },
}

const REASONS: Record<string,string> = {
  damaged:'Damaged', wrong_item:'Wrong Item', not_as_described:'Not as Described', changed_mind:'Changed Mind', other:'Other'
}

export default function ReturnsPage() {
  const router = useRouter()
  const [items, setItems]   = useState<any[]>([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (!getToken()) { router.replace('/'); return }; load() }, [])
  const load = (s = filter) => {
    setLoading(true)
    api.get(`/api/admin/returns?status=${s}`).then(r => { setItems(r.data); setLoading(false) }).catch(()=>setLoading(false))
  }

  const approve = async (id: string) => {
    await api.put(`/api/admin/returns/${id}/approve`).catch(()=>{})
    toast.success('Return approved'); load()
  }

  const reject = async (id: string) => {
    const note = prompt('Rejection note (optional):')
    await api.put(`/api/admin/returns/${id}/reject?note=${encodeURIComponent(note||'')}`).catch(()=>{})
    toast.success('Return rejected'); load()
  }

  return (
    <Shell>
      <div className="noscroll" style={{ display:'flex', gap:7, padding:'12px 14px 0', overflowX:'auto' }}>
        {['pending','approved','rejected'].map(s => (
          <button key={s} onClick={() => { setFilter(s); load(s) }} style={{ flexShrink:0, padding:'7px 14px', borderRadius:99, fontSize:12, fontWeight:700, cursor:'pointer', background: filter===s?'linear-gradient(135deg,#7c3aed,#4f46e5)':'var(--s2)', border: filter===s?'none':'1px solid var(--bdr2)', color: filter===s?'white':'var(--txt2)', textTransform:'capitalize' }}>
            {s}
          </button>
        ))}
      </div>

      <div className="anim-fadeup" style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}><div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid var(--accent-lt)', borderTopColor:'var(--accent)', animation:'spin 1s linear infinite' }}/></div>
        ) : items.length === 0 ? (
          <p style={{ textAlign:'center', paddingTop:60, color:'var(--txt2)' }}>No {filter} returns</p>
        ) : items.map((item:any) => {
          const s = STATUS_CFG[item.status]
          return (
            <div key={item.id} style={{ background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18, padding:'13px 14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:13, color:'var(--txt)' }}>{item.order?.order_number||'Order'}</p>
                  <p style={{ fontSize:12, color:'var(--txt2)', marginTop:1 }}>{item.user?.name}</p>
                </div>
                <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:99, background:s.bg, color:s.c }}>{s.label}</span>
              </div>
              <p style={{ fontSize:12, color:'var(--txt2)', marginBottom:4 }}>Reason: <strong>{REASONS[item.reason]||item.reason}</strong></p>
              {item.details && <p style={{ fontSize:12, color:'var(--txt3)', marginBottom:4 }}>{item.details}</p>}
              <p style={{ fontSize:12, color:'var(--txt2)', marginBottom: item.status==='pending'?10:0 }}>Refund via: <strong>{item.refund_method}</strong> · {new Date(item.created_at).toLocaleDateString()}</p>
              {item.status === 'pending' && (
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => approve(item.id)} style={{ flex:1, padding:'9px', borderRadius:10, border:'none', background:'var(--green-lt)', color:'var(--green)', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}><Check size={13}/>Approve</button>
                  <button onClick={() => reject(item.id)} style={{ flex:1, padding:'9px', borderRadius:10, border:'none', background:'var(--red-lt)', color:'var(--red)', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}><X size={13}/>Reject</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Shell>
  )
}
