'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Users, TrendingUp, Clock, ChevronRight } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'

const STATUS: Record<string,{bg:string,c:string}> = {
  pending:    { bg:'var(--amber-lt)', c:'var(--amber)' },
  confirmed:  { bg:'var(--blue-lt)',  c:'var(--blue)'  },
  processing: { bg:'var(--purple-lt)',c:'var(--purple)' },
  shipped:    { bg:'rgba(249,115,22,.13)', c:'#f97316' },
  delivered:  { bg:'var(--green-lt)', c:'var(--green)' },
  cancelled:  { bg:'var(--red-lt)',   c:'var(--red)'   },
}

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!getToken()) { router.replace('/'); return }
    api.get('/api/admin/dashboard').then(r => setData(r.data)).catch(() => router.replace('/'))
  }, [])

  if (!data) return (
    <Shell>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', border:'3px solid var(--accent-lt)', borderTopColor:'var(--accent)', animation:'spin 1s linear infinite' }} />
      </div>
    </Shell>
  )

  const stats = [
    { label:'Total Orders', val: data.total_orders||0,    Icon:ShoppingBag, accent:'#7c3aed', shadow:'rgba(124,58,237,.3)' },
    { label:'Pending',      val: data.pending_orders||0,  Icon:Clock,       accent:'#f59e0b', shadow:'rgba(245,158,11,.3)' },
    { label:'Users',        val: data.total_users||0,     Icon:Users,       accent:'#3b82f6', shadow:'rgba(59,130,246,.3)' },
    { label:'Revenue',      val:`৳${Math.round(data.total_revenue||0)}`, Icon:TrendingUp, accent:'#10b981', shadow:'rgba(16,185,129,.3)' },
  ]

  return (
    <Shell>
      <div className="anim-fadeup" style={{ padding:'16px 14px', display:'flex', flexDirection:'column', gap:14 }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {stats.map(({ label, val, Icon, accent, shadow }) => (
            <div key={label} style={{
              background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18, padding:16,
            }}>
              <div style={{
                width:38, height:38, borderRadius:11, marginBottom:12,
                background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:`0 4px 12px ${shadow}`,
              }}>
                <Icon size={18} color={accent} strokeWidth={1.8} />
              </div>
              <p style={{ fontSize:24, fontWeight:800, color:'var(--txt)', letterSpacing:'-0.5px' }}>{val}</p>
              <p style={{ fontSize:12, color:'var(--txt2)', fontWeight:500, marginTop:2 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        {data.recent_orders?.length > 0 && (
          <div style={{ background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', borderBottom:'1px solid var(--bdr)' }}>
              <p style={{ fontWeight:700, fontSize:14, color:'var(--txt)' }}>Recent Orders</p>
              <button onClick={() => router.push('/orders')} style={{
                display:'flex', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer',
                color:'var(--accent-text)', fontSize:12, fontWeight:600,
              }}>
                All <ChevronRight size={13} />
              </button>
            </div>
            {data.recent_orders.map((o: any) => {
              const s = STATUS[o.status] || STATUS.pending
              return (
                <div key={o.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'1px solid var(--bdr)' }}>
                  <div>
                    <p style={{ fontWeight:700, fontSize:13, color:'var(--accent-text)' }}>{o.order_number}</p>
                    <p style={{ fontSize:11, color:'var(--txt2)', marginTop:2 }}>{o.delivery_name}</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ fontWeight:700, fontSize:13, color:'var(--txt)' }}>৳{Math.round(o.total_amount)}</p>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:s.bg, color:s.c, display:'inline-block', marginTop:2, textTransform:'capitalize' }}>
                      {o.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Shell>
  )
}
