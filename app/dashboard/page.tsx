'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Users, TrendingUp, Clock, Package, ChevronRight } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'

const STATUS_STYLE: Record<string,{bg:string,color:string}> = {
  pending:    { bg:'#fef3c7', color:'#92400e' },
  confirmed:  { bg:'#dbeafe', color:'#1e3a5f' },
  processing: { bg:'#ede9fe', color:'#4c1d95' },
  shipped:    { bg:'#ffedd5', color:'#7c2d12' },
  delivered:  { bg:'#dcfce7', color:'#14532d' },
  cancelled:  { bg:'#fee2e2', color:'#7f1d1d' },
}

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!getToken()) { router.replace('/'); return }
    api.get('/api/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => router.replace('/'))
  }, [])

  if (!data) return (
    <Shell>
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand-light)', borderTopColor: 'var(--brand)' }} />
      </div>
    </Shell>
  )

  const stats = [
    { label: 'Total Orders', value: data.total_orders   || 0, Icon: ShoppingBag, bg: '#dbeafe', ic: '#1d4ed8' },
    { label: 'Pending',      value: data.pending_orders || 0, Icon: Clock,       bg: '#fef3c7', ic: '#d97706' },
    { label: 'Users',        value: data.total_users    || 0, Icon: Users,       bg: '#ede9fe', ic: '#7c3aed' },
    { label: 'Revenue',      value: `৳${Math.round(data.total_revenue || 0)}`, Icon: TrendingUp, bg: '#dcfce7', ic: '#15803d' },
  ]

  return (
    <Shell title="Dashboard">
      <div className="px-4 py-5 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, Icon, bg, ic }) => (
            <div key={label} className="rounded-3xl p-4 shadow-sm" style={{ background: 'var(--card)' }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon size={18} style={{ color: ic }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        {data.recent_orders?.length > 0 && (
          <div className="rounded-3xl overflow-hidden shadow-sm" style={{ background: 'var(--card)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>Recent Orders</p>
              <button onClick={() => router.push('/orders')} className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--brand)' }}>
                See all <ChevronRight size={13} />
              </button>
            </div>
            <div>
              {data.recent_orders.map((o: any) => {
                const s = STATUS_STYLE[o.status] || STATUS_STYLE.pending
                return (
                  <div key={o.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--brand)' }}>{o.order_number}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{o.delivery_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>৳{Math.round(o.total_amount)}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: s.bg, color: s.color }}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}
