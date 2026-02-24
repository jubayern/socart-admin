'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Send, MessageCircle } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'
import { toast } from '../../lib/toast'

const STATUS_CFG: Record<string,{bg:string,c:string,label:string}> = {
  open:        { bg:'var(--red-lt)',    c:'var(--red)',    label:'Open'        },
  in_progress: { bg:'var(--amber-lt)', c:'var(--amber)',  label:'In Progress' },
  closed:      { bg:'var(--green-lt)', c:'var(--green)',  label:'Closed'      },
}
const CAT: Record<string,string> = { order:'Order', payment:'Payment', delivery:'Delivery', other:'Other' }

export default function SupportPage() {
  const router = useRouter()
  const [tickets, setTickets]   = useState<any[]>([])
  const [sel, setSel]           = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [reply, setReply]       = useState('')
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('')

  useEffect(() => { if (!getToken()) { router.replace('/'); return }; load() }, [])

  const load = async (s?: string) => {
    setLoading(true)
    const r = await api.get('/api/admin/support/tickets' + (s ? `?status=${s}` : '')).catch(()=>({data:[]}))
    setTickets(r.data); setLoading(false)
  }

  const openTicket = async (t: any) => {
    const r = await api.get(`/api/admin/support/tickets/${t.id}`).catch(()=>null)
    if (r) { setSel(r.data); setMessages(r.data.messages || []) }
  }

  const sendReply = async () => {
    if (!reply.trim() || !sel) return
    try {
      await api.post(`/api/admin/support/tickets/${sel.id}/reply`, { message: reply })
      toast.success('Reply sent')
      setReply('')
      setMessages(m => [...m, { sender:'admin', message:reply, created_at:new Date().toISOString() }])
    } catch { toast.error('Failed') }
  }

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/api/admin/support/tickets/${id}/status?status=${status}`).catch(()=>{})
    toast.success(`Status → ${STATUS_CFG[status]?.label}`)
    load(filter||undefined)
    if (sel?.id === id) setSel((p:any) => ({...p, status}))
  }

  const iS: React.CSSProperties = { background:'var(--s2)', border:'1.5px solid var(--bdr2)', borderRadius:12, padding:'12px 14px', fontSize:14, color:'var(--txt)', width:'100%' }

  return (
    <Shell>
      <div className="noscroll" style={{ display:'flex', gap:7, padding:'12px 14px 0', overflowX:'auto' }}>
        {['','open','in_progress','closed'].map(s => (
          <button key={s} onClick={() => { setFilter(s); load(s||undefined) }} style={{
            flexShrink:0, padding:'7px 14px', borderRadius:99, fontSize:12, fontWeight:700, cursor:'pointer',
            background: filter===s ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'var(--s2)',
            border: filter===s ? 'none' : '1px solid var(--bdr2)',
            color: filter===s ? 'white' : 'var(--txt2)',
          }}>
            {s ? STATUS_CFG[s]?.label : 'All'}
          </button>
        ))}
      </div>

      <div className="anim-fadeup" style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid var(--accent-lt)', borderTopColor:'var(--accent)', animation:'spin 1s linear infinite' }} />
          </div>
        ) : tickets.length === 0 ? (
          <p style={{ textAlign:'center', paddingTop:60, color:'var(--txt2)' }}>No tickets</p>
        ) : tickets.map((t:any) => {
          const s = STATUS_CFG[t.status] || STATUS_CFG.open
          return (
            <div key={t.id} onClick={() => openTicket(t)} style={{ background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18, padding:'13px 14px', cursor:'pointer' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:s.bg, color:s.c }}>{s.label}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:'var(--s3)', color:'var(--txt2)' }}>{CAT[t.category]||t.category}</span>
              </div>
              <p style={{ fontWeight:700, fontSize:13, color:'var(--txt)' }}>{t.subject}</p>
              <p style={{ fontSize:12, color:'var(--txt2)', marginTop:3 }}>{t.user?.name} · {new Date(t.updated_at).toLocaleDateString()}</p>
            </div>
          )
        })}
      </div>

      {sel && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.65)' }} onClick={() => setSel(null)} />
          <div className="anim-slideup" style={{ position:'relative', width:'100%', height:'90vh', display:'flex', flexDirection:'column', background:'var(--s1)', borderRadius:'22px 22px 0 0', border:'1px solid var(--bdr2)', borderBottom:'none' }}>
            <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 4px' }}><div style={{ width:36, height:3, borderRadius:99, background:'var(--s4)' }} /></div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 18px 12px', borderBottom:'1px solid var(--bdr)' }}>
              <div>
                <p style={{ fontWeight:800, fontSize:14, color:'var(--txt)' }}>{sel.subject}</p>
                <p style={{ fontSize:11, color:'var(--txt2)', marginTop:2 }}>{sel.user?.name} · {CAT[sel.category]}</p>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <select value={sel.status} onChange={e => updateStatus(sel.id, e.target.value)} style={{ ...iS, width:'auto', padding:'6px 10px', fontSize:12 }}>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
                <button onClick={() => setSel(null)} style={{ width:30, height:30, borderRadius:8, background:'var(--s3)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={14} color="var(--txt2)" /></button>
              </div>
            </div>

            <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }}>
              {messages.map((m:any, i:number) => (
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems: m.sender==='admin' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth:'80%', padding:'10px 14px', borderRadius:14, fontSize:13,
                    background: m.sender==='admin' ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'var(--s3)',
                    color: m.sender==='admin' ? 'white' : 'var(--txt)',
                  }}>
                    {m.message}
                  </div>
                  <p style={{ fontSize:10, color:'var(--txt3)', marginTop:3 }}>{m.sender === 'admin' ? 'You' : sel.user?.name} · {new Date(m.created_at).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>

            <div style={{ padding:'12px 16px 28px', borderTop:'1px solid var(--bdr)', display:'flex', gap:10 }}>
              <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key==='Enter' && sendReply()}
                placeholder="Type reply..." style={{ ...iS, flex:1 }} />
              <button onClick={sendReply} disabled={!reply.trim()} style={{ width:46, height:46, borderRadius:12, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', opacity:!reply.trim()?0.5:1 }}>
                <Send size={17} color="white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
