'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react'
import Layout from '../../components/Layout'
import { api, getToken, getRole } from '../../lib/api'

export default function AdminsPage() {
  const router = useRouter()
  const [admins, setAdmins]   = useState<any[]>([])
  const [newTgId, setNewTgId] = useState('')
  const [adding, setAdding]   = useState(false)

  useEffect(() => {
    if (!getToken() || getRole() !== 'root') { router.push('/dashboard'); return }
    load()
  }, [])

  const load = () => api.get('/api/admin/admins').then(r => setAdmins(r.data)).catch(() => {})

  const add = async () => {
    if (!newTgId.trim()) return
    setAdding(true)
    try {
      await api.post(`/api/admin/admins/add?target_telegram_id=${newTgId}`)
      setNewTgId(''); load()
    } catch (e: any) { alert(e?.response?.data?.detail || 'Failed') }
    setAdding(false)
  }

  const remove = async (tgId: number, name: string) => {
    if (!confirm(`Remove ${name || tgId} as admin?`)) return
    await api.delete(`/api/admin/admins/remove?target_telegram_id=${tgId}`)
    load()
  }

  return (
    <Layout>
      <div className="px-4 py-4 space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
          Add a user's Telegram ID. They can send <strong>/admin</strong> to the bot to access the panel.
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="font-semibold text-slate-700 text-sm mb-3">Add Admin</p>
          <div className="flex gap-2">
            <input type="number" placeholder="Telegram ID" value={newTgId}
              onChange={e => setNewTgId(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 font-mono" />
            <button onClick={add} disabled={adding || !newTgId}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5">
              {adding ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus size={15} />}
              Add
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Admins & Root
          </div>
          <div className="divide-y divide-slate-50">
            {admins.length === 0
              ? <p className="text-center py-8 text-slate-400 text-sm">No admins yet</p>
              : admins.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${a.role === 'root' ? 'bg-purple-100' : 'bg-blue-50'}`}>
                      {a.role === 'root' ? <ShieldAlert size={17} className="text-purple-600" /> : <ShieldCheck size={17} className="text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{a.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 font-mono">{a.telegram_id}{a.username ? ` · @${a.username}` : ''}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${a.role === 'root' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {a.role}
                    </span>
                    {a.role !== 'root' && (
                      <button onClick={() => remove(a.telegram_id, a.name)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </Layout>
  )
}
