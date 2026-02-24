'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Ban, ShieldCheck, User } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'
import { toast } from '../../lib/toast'

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers]     = useState<any[]>([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) { router.replace('/'); return }
    api.get('/api/users/').then(r => { setUsers(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const block = async (id: string, name: string, val: boolean) => {
    try {
      await api.put(`/api/users/${id}/block?is_blocked=${val}`)
      setUsers(u => u.map(x => x.id===id ? {...x,is_blocked:val} : x))
      toast.success(val ? `${name} blocked` : `${name} unblocked`)
    } catch { toast.error('Failed') }
  }

  const ROLE: Record<string,{bg:string,c:string}> = {
    root:  { bg:'var(--purple-lt)', c:'var(--purple)' },
    admin: { bg:'var(--blue-lt)',   c:'var(--blue)'   },
    user:  { bg:'var(--s3)',        c:'var(--txt2)'   },
  }

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    String(u.telegram_id).includes(search)
  )

  return (
    <Shell>
      <div className="anim-fadeup" style={{ padding:'14px' }}>
        <div style={{ position:'relative', marginBottom:14 }}>
          <Search size={15} color="var(--txt3)" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            style={{ background:'var(--s1)', border:'1.5px solid var(--bdr2)', borderRadius:14, padding:'12px 14px 12px 40px', fontSize:14, color:'var(--txt)', width:'100%' }} />
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid var(--accent-lt)', borderTopColor:'var(--accent)', animation:'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {filtered.map((u: any) => {
              const rs = ROLE[u.role] || ROLE.user
              return (
                <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18 }}>
                  <div style={{ width:44, height:44, borderRadius:13, flexShrink:0, background:'var(--accent-lt)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <User size={20} color="var(--accent-text)" />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <p style={{ fontWeight:700, fontSize:13, color:'var(--txt)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name||'Unknown'}</p>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99, flexShrink:0, background:rs.bg, color:rs.c, textTransform:'capitalize' }}>{u.role}</span>
                    </div>
                    <p style={{ fontSize:11, color:'var(--txt3)', fontFamily:'monospace', marginTop:2 }}>{u.telegram_id}{u.username ? ` · @${u.username}` : ''}</p>
                  </div>
                  <button onClick={() => block(u.id, u.name, !u.is_blocked)} style={{
                    width:38, height:38, borderRadius:11, flexShrink:0, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', border:'none',
                    background: u.is_blocked ? 'var(--green-lt)' : 'var(--red-lt)',
                    color:      u.is_blocked ? 'var(--green)'    : 'var(--red)',
                  }}>
                    {u.is_blocked ? <ShieldCheck size={17}/> : <Ban size={17}/>}
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
