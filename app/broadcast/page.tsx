'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Users } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'

export default function BroadcastPage() {
  const router = useRouter()
  const [msg, setMsg]         = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult]   = useState<any>(null)
  const [count, setCount]     = useState(0)

  useEffect(() => {
    if (!getToken()) { router.replace('/'); return }
    api.get('/api/users/').then(r => setCount(r.data.filter((u: any) => !u.is_blocked).length)).catch(()=>{})
  }, [])

  const send = async () => {
    if (!msg.trim()) return
    setSending(true); setResult(null)
    const r = await api.post('/api/admin/broadcast', { message: msg }).catch(() => null)
    setResult(r?.data || { error: 'Failed to send' })
    setSending(false)
    if (r?.data?.sent) setMsg('')
  }

  return (
    <Shell title="Broadcast">
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-3xl shadow-sm" style={{ background:'var(--card)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background:'var(--brand-light)' }}>
            <Users size={22} style={{ color:'var(--brand)' }} />
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color:'var(--text)' }}>{count}</p>
            <p className="text-xs" style={{ color:'var(--muted)' }}>Active recipients</p>
          </div>
        </div>

        <div className="rounded-3xl p-4 shadow-sm" style={{ background:'var(--card)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color:'var(--muted)' }}>Message</p>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={9}
            placeholder={'Write your message...\n\n<b>Bold</b>  <i>Italic</i>  supported'}
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none font-mono"
            style={{ background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)' }} />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs" style={{ color:'var(--muted)' }}>{msg.length} chars</p>
            <button onClick={send} disabled={sending || !msg.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background:'var(--brand)' }}>
              {sending
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Sending...</>
                : <><Send size={14}/>Send to All</>
              }
            </button>
          </div>
        </div>

        {result && (
          <div className="rounded-3xl p-4" style={{
            background: result.error ? '#fee2e2' : '#dcfce7',
            border: `1.5px solid ${result.error ? '#fca5a5' : '#86efac'}`
          }}>
            {result.error
              ? <p className="font-semibold text-sm" style={{ color:'#7f1d1d' }}>{result.error}</p>
              : <>
                  <p className="font-bold text-sm" style={{ color:'#14532d' }}>Sent successfully!</p>
                  <p className="text-xs mt-0.5" style={{ color:'#166534' }}>Sent: {result.sent} · Failed: {result.failed}</p>
                </>
            }
          </div>
        )}
      </div>
    </Shell>
  )
}
