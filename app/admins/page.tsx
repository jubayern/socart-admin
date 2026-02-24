'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken, getRole } from '../../lib/api'
import { toast } from '../../lib/toast'

export default function AdminsPage() {
  const router = useRouter()
  const [admins, setAdmins] = useState<any[]>([])
  const [newId, setNewId]   = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!getToken() || getRole() !== 'root') { router.replace('/dashboard'); return }
    load()
  }, [])

  const load = () => api.get('/api/admin/admins').then(r => setAdmins(r.data)).catch(()=>{})

  const add = async () => {
    if (!newId.trim()) return
    setAdding(true)
    try {
      await api.post(`/api/admin/admins/add?target_telegram_id=${newId}`)
      toast.success('Admin added!'); setNewId(''); load()
    } catch (e: any) { toast.error(e?.response?.data?.detail || 'Failed to add admin') }
    setAdding(false)
  }

  const remove = async (tgId: number, name: string) => {
    if (!confirm(`Remove ${name||tgId} as admin?`)) return
    try {
      await api.delete(`/api/admin/admins/remove?target_telegram_id=${tgId}`)
      toast.success(`${name} removed`); load()
    } catch { toast.error('Failed to remove admin') }
  }

  return (
    <Shell>
      <div className="anim-fadeup" style={{ padding:'14px', display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18, padding:'14px 16px' }}>
          <p style={{ fontWeight:700, fontSize:13, color:'var(--txt)', marginBottom:6 }}>Add Admin</p>
          <p style={{ fontSize:12, color:'var(--txt2)', marginBottom:12 }}>
            Enter Telegram ID. They use <code style={{ background:'var(--accent-lt)', color:'var(--accent-text)', padding:'1px 6px', borderRadius:5, fontWeight:700 }}>/admin</code> to access the panel.
          </p>
          <div style={{ display:'flex', gap:10 }}>
            <input type="number" placeholder="Telegram ID" value={newId} onChange={e => setNewId(e.target.value)}
              onKeyDown={e => e.key==='Enter' && add()}
              style={{ flex:1, background:'var(--s2)', border:'1.5px solid var(--bdr2)', borderRadius:12, padding:'12px 14px', fontSize:14, color:'var(--txt)', fontFamily:'monospace' }} />
            <button onClick={add} disabled={adding||!newId} style={{
              display:'flex', alignItems:'center', gap:7, padding:'12px 18px', borderRadius:12, border:'none', cursor:'pointer',
              background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', fontSize:13, fontWeight:700,
              opacity: !newId?0.5:1,
            }}>
              {adding ? <div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,.3)', borderTopColor:'white', animation:'spin 1s linear infinite' }}/> : <Plus size={15}/>}
              Add
            </button>
          </div>
        </div>

        <div style={{ background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18, overflow:'hidden' }}>
          <div style={{ padding:'13px 16px', borderBottom:'1px solid var(--bdr)' }}>
            <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--txt3)' }}>Admin List</p>
          </div>
          {admins.length === 0
            ? <p style={{ textAlign:'center', padding:'32px 0', color:'var(--txt2)', fontSize:13 }}>No admins added yet</p>
            : admins.map((a: any) => (
              <div key={a.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid var(--bdr)' }}>
                <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: a.role==='root'?'var(--purple-lt)':'var(--accent-lt)' }}>
                  {a.role==='root' ? <ShieldAlert size={18} color="var(--purple)"/> : <ShieldCheck size={18} color="var(--accent-text)"/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:13, color:'var(--txt)' }}>{a.name||'Unknown'}</p>
                  <p style={{ fontSize:11, color:'var(--txt3)', fontFamily:'monospace', marginTop:1 }}>{a.telegram_id}{a.username ? ` · @${a.username}` : ''}</p>
                </div>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background: a.role==='root'?'var(--purple-lt)':'var(--accent-lt)', color: a.role==='root'?'var(--purple)':'var(--accent-text)', textTransform:'capitalize', flexShrink:0 }}>
                  {a.role}
                </span>
                {a.role !== 'root' && (
                  <button onClick={() => remove(a.telegram_id, a.name)} style={{ width:32, height:32, borderRadius:9, background:'var(--red-lt)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                    <Trash2 size={13} color="var(--red)"/>
                  </button>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </Shell>
  )
}
