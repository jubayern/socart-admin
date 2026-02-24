'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Users, TrendingUp, Clock } from 'lucide-react'
import Layout from '../../components/Layout'
import { api, getToken } from '../../lib/api'

const STATUS_COLOR: Record<string, string> = {
  pending:    'bg-amber-100 text-amber-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-orange-100 text-orange-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-rose-100 text-rose-700',
}

export default function Dashboard() {
  const router = useRouter()
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) { router.push('/'); return }
    api.get('/api/admin/dashboard')
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => router.push('/'))
  }, [])

  if (loading) return (
    <Layout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div></Layout>
  )

  const stats = [
    { label: 'Orders',    value: data?.total_orders,                    Icon: ShoppingBag, color: 'bg-blue-500'   },
    { label: 'Pending',   value: data?.pending_orders,                  Icon: Clock,       color: 'bg-amber-500'  },
    { label: 'Users',     value: data?.total_users,                     Icon: Users,       color: 'bg-purple-500' },
    { label: 'Revenue',   value: `৳${(data?.total_revenue||0).toFixed(0)}`, Icon: TrendingUp,  color: 'bg-green-500'  },
  ]

  return (
    <Layout>
      <div className="px-4 py-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={17} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm">Recent Orders</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {data?.recent_orders?.map((o: any) => (
              <div key={o.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-blue-600 text-sm">{o.order_number}</p>
                  <p className="text-xs text-slate-500 truncate">{o.delivery_name || o.users?.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-slate-800 text-sm">৳{parseFloat(o.total_amount).toFixed(0)}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[o.status] || ''}`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
