'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShieldCheck, Ban, User } from 'lucide-react'
import Layout from '../../components/Layout'
import { api, getToken } from '../../lib/api'

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers]     = useState<any[]>([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) { router.push('/'); return }
    api.get('/api/users/').then(r => { setUsers(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const block = async (id: string, val: boolean) => {
    await api.put(`/api/users/${id}/block?is_blocked=${val}`)
    setUsers(u => u.map(x => x.id === id ? { ...x, is_blocked: val } : x))
  }

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    String(u.telegram_id).includes(search)
  )

  const ROLE_BADGE: Record<string, string> = {
    root:  'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    user:  'bg-slate-100 text-slate-600',
  }

  return (
    <Layout>
      <div className="px-4 py-4">
        <div className="relative mb-3">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, username, ID..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400" />
        </div>

        {loading
          ? <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          : <div className="space-y-2">
              {filtered.map((u: any) => (
                <div key={u.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {u.avatar_url
                      ? <img src={u.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                      : <User size={18} className="text-blue-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-semibold text-slate-800 text-sm truncate">{u.name}</p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md capitalize flex-shrink-0 ${ROLE_BADGE[u.role] || ROLE_BADGE.user}`}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{u.telegram_id}{u.username ? ` · @${u.username}` : ''}</p>
                  </div>
                  <button onClick={() => block(u.id, !u.is_blocked)}
                    className={`p-2 rounded-xl flex-shrink-0 ${u.is_blocked ? 'text-green-600 bg-green-50' : 'text-rose-500 bg-rose-50'}`}>
                    {u.is_blocked ? <ShieldCheck size={18} /> : <Ban size={18} />}
                  </button>
                </div>
              ))}
            </div>
        }
      </div>
    </Layout>
  )
}
