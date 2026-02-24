'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken, getRole } from '../../lib/api'

export default function AdminsPage() {
  const router = useRouter()
  const [admins, setAdmins]   = useState<any[]>([])
  const [newId, setNewId]     = useState('')
  const [adding, setAdding]   = useState(false)

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
      setNewId(''); load()
    } catch (e: any) { alert(e?.response?.data?.detail || 'Failed') }
    setAdding(false)
  }

  const remove = async (tgId: number, name: string) => {
    if (!confirm(`Remove ${name||tgId} as admin?`)) return
    await api.delete(`/api/admin/admins/remove?target_telegram_id=${tgId}`)
    load()
  }

  return (
    <Shell title="Admins">
      <div className="px-4 py-4 space-y-4">
        <div className="rounded-3xl p-4 shadow-sm" style={{ background:'var(--card)', border:'1.5px solid #dbeafe' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color:'var(--brand)' }}>Add Admin</p>
          <p className="text-xs mb-3" style={{ color:'var(--muted)' }}>
            Enter the user's Telegram ID. They'll use <span className="font-mono font-bold" style={{ color:'var(--brand)' }}>/admin</span> in the bot to access the panel.
          </p>
          <div className="flex gap-2">
            <input type="number" placeholder="Telegram ID" value={newId}
              onChange={e => setNewId(e.target.value)} onKeyDown={e => e.key==='Enter'&&add()}
              className="flex-1 px-4 py-3 rounded-2xl text-sm font-mono outline-none"
              style={{ background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)' }} />
            <button onClick={add} disabled={adding||!newId}
              className="px-4 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-50 flex items-center gap-1.5"
              style={{ background:'var(--brand)' }}>
              {adding ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Plus size={16}/>}
              Add
            </button>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-sm" style={{ background:'var(--card)' }}>
          <div className="px-4 py-3" style={{ borderBottom:'1px solid var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color:'var(--muted)' }}>Admin List</p>
          </div>
          {admins.length === 0 ? (
            <p className="text-center py-10 text-sm" style={{ color:'var(--muted)' }}>No admins added yet</p>
          ) : admins.map((a: any) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom:'1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: a.role==='root' ? '#ede9fe' : 'var(--brand-light)' }}>
                {a.role==='root'
                  ? <ShieldAlert size={18} style={{ color:'#7c3aed' }} />
                  : <ShieldCheck size={18} style={{ color:'var(--brand)' }} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color:'var(--text)' }}>{a.name||'Unknown'}</p>
                <p className="text-xs font-mono" style={{ color:'var(--muted)' }}>
                  {a.telegram_id}{a.username ? ` · @${a.username}` : ''}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                style={{ background: a.role==='root'?'#ede9fe':'var(--brand-light)', color: a.role==='root'?'#4c1d95':'var(--brand)' }}>
                {a.role}
              </span>
              {a.role !== 'root' && (
                <button onClick={() => remove(a.telegram_id, a.name)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background:'#fee2e2', color:'#ef4444' }}>
                  <Trash2 size={15}/>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Shell>
  )
}
