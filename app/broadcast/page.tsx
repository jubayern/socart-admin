'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Users } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'
import { toast } from '../../lib/toast'

export default function BroadcastPage() {
  const router = useRouter()
  const [msg, setMsg]         = useState('')
  const [sending, setSending] = useState(false)
  const [count, setCount]     = useState(0)

  useEffect(() => {
    if (!getToken()) { router.replace('/'); return }
    api.get('/api/users/').then(r => setCount(r.data.filter((u:any) => !u.is_blocked).length)).catch(()=>{})
  }, [])

  const send = async () => {
    if (!msg.trim()) return
    setSending(true)
    try {
      const r = await api.post('/api/admin/broadcast', { message: msg })
      toast.success(`Sent to ${r.data.sent} users!`)
      setMsg('')
    } catch { toast.error('Broadcast failed') }
    setSending(false)
  }

  return (
    <Shell>
      <div className="anim-fadeup" style={{ padding:'14px', display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18 }}>
          <div style={{ width:46, height:46, borderRadius:13, flexShrink:0, background:'var(--accent-lt)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Users size={22} color="var(--accent-text)" />
          </div>
          <div>
            <p style={{ fontSize:22, fontWeight:800, color:'var(--txt)' }}>{count}</p>
            <p style={{ fontSize:12, color:'var(--txt2)' }}>active recipients</p>
          </div>
        </div>

        <div style={{ background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18, padding:'16px' }}>
          <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--txt3)', marginBottom:10 }}>Message</p>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={9}
            placeholder={'Write your message...\n\n<b>Bold</b>  <i>Italic</i>  supported'}
            style={{ background:'var(--s2)', border:'1.5px solid var(--bdr2)', borderRadius:12, padding:'12px 14px', fontSize:13, color:'var(--txt)', width:'100%', resize:'none', fontFamily:'monospace', lineHeight:1.7 }} />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:12 }}>
            <p style={{ fontSize:12, color:'var(--txt3)' }}>{msg.length} chars</p>
            <button onClick={send} disabled={sending||!msg.trim()} style={{
              display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:12, border:'none', cursor:'pointer',
              background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', fontSize:13, fontWeight:700,
              boxShadow:'0 4px 16px rgba(124,58,237,.35)', opacity: !msg.trim()?0.5:1,
            }}>
              {sending
                ? <><div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,.3)', borderTopColor:'white', animation:'spin 1s linear infinite' }}/>Sending...</>
                : <><Send size={13}/>Send to All</>
              }
            </button>
          </div>
        </div>
      </div>
    </Shell>
  )
}
