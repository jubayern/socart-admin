'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Users } from 'lucide-react'
import Layout from '../../components/Layout'
import { api, getToken } from '../../lib/api'

export default function BroadcastPage() {
  const router = useRouter()
  const [message, setMessage]     = useState('')
  const [sending, setSending]     = useState(false)
  const [result, setResult]       = useState<any>(null)
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    if (!getToken()) { router.push('/'); return }
    api.get('/api/users/').then(r => setUserCount(r.data.filter((u: any) => !u.is_blocked).length)).catch(() => {})
  }, [])

  const send = async () => {
    if (!message.trim()) return
    setSending(true); setResult(null)
    const r = await api.post('/api/admin/broadcast', { message }).catch(() => null)
    setResult(r?.data || { error: 'Failed' })
    setSending(false)
    if (r?.data?.sent) setMessage('')
  }

  return (
    <Layout>
      <div className="px-4 py-4 space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-800">{userCount} recipients</p>
            <p className="text-xs text-blue-500">All active users</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-2">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={8}
            placeholder={"Write your message...\n\n<b>Bold</b> · <i>Italic</i> supported"}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 resize-none font-mono" />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-slate-400">{message.length} chars</p>
            <button onClick={send} disabled={sending || !message.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
              {sending
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                : <><Send size={14} /> Send to All</>
              }
            </button>
          </div>
        </div>

        {result && (
          <div className={`rounded-2xl px-4 py-3 border ${result.error ? 'bg-rose-50 border-rose-100' : 'bg-green-50 border-green-100'}`}>
            {result.error
              ? <p className="text-rose-700 text-sm font-medium">{result.error}</p>
              : <><p className="text-green-700 font-semibold text-sm">Done!</p>
                 <p className="text-xs text-green-600 mt-0.5">Sent: {result.sent} · Failed: {result.failed}</p></>
            }
          </div>
        )}
      </div>
    </Layout>
  )
}
