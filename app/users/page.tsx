'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Ban, ShieldCheck, User } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers]     = useState<any[]>([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) { router.replace('/'); return }
    api.get('/api/users/').then(r => { setUsers(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const block = async (id: string, val: boolean) => {
    await api.put(`/api/users/${id}/block?is_blocked=${val}`)
    setUsers(u => u.map(x => x.id===id ? {...x,is_blocked:val} : x))
  }

  const ROLE: Record<string,{bg:string,color:string}> = {
    root:  {bg:'#ede9fe',color:'#4c1d95'},
    admin: {bg:'#dbeafe',color:'#1e3a5f'},
    user:  {bg:'#f3f4f6',color:'#374151'},
  }

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    String(u.telegram_id).includes(search)
  )

  return (
    <Shell title="Users">
      <div className="px-4 py-4">
        <div className="relative mb-4">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color:'var(--muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none"
            style={{ background:'var(--card)', border:'1.5px solid var(--border)', color:'var(--text)' }} />
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor:'var(--brand-light)', borderTopColor:'var(--brand)' }} />
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((u: any) => {
              const rs = ROLE[u.role] || ROLE.user
              return (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-3xl shadow-sm" style={{ background:'var(--card)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background:'var(--brand-light)' }}>
                    <User size={20} style={{ color:'var(--brand)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm truncate" style={{ color:'var(--text)' }}>{u.name||'Unknown'}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex-shrink-0" style={{ background:rs.bg, color:rs.color }}>
                        {u.role}
                      </span>
                    </div>
                    <p className="text-xs font-mono mt-0.5" style={{ color:'var(--muted)' }}>
                      {u.telegram_id}{u.username ? ` · @${u.username}` : ''}
                    </p>
                  </div>
                  <button onClick={() => block(u.id, !u.is_blocked)}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: u.is_blocked ? '#dcfce7' : '#fee2e2', color: u.is_blocked ? '#15803d' : '#ef4444' }}>
                    {u.is_blocked ? <ShieldCheck size={18} /> : <Ban size={18} />}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Shell>
  )
}
