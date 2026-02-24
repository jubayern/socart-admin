'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'
import { api, getTg } from '../lib/api'

export default function AuthPage() {
  const router = useRouter()
  const [st, setSt] = useState<'loading'|'ok'|'err'|'notg'>('loading')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const tg = getTg()
    if (!tg?.initData) { setSt('notg'); return }
    tg.ready(); tg.expand()
    api.post('/api/admin/login', { init_data: tg.initData })
      .then(r => {
        localStorage.setItem('admin_token', r.data.token)
        localStorage.setItem('admin_role',  r.data.role)
        localStorage.setItem('admin_tgid',  String(r.data.telegram_id))
        setSt('ok')
        setTimeout(() => router.replace('/dashboard'), 900)
      })
      .catch(e => { setMsg(e?.response?.data?.detail || 'Access denied'); setSt('err') })
  }, [])

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', padding:24,
      background:'var(--base)',
    }}>
      {/* ambient glow */}
      <div style={{
        position:'fixed', width:400, height:400, borderRadius:'50%', top:'10%', left:'50%', transform:'translateX(-50%)',
        background:'radial-gradient(circle, rgba(124,58,237,.12) 0%, transparent 70%)',
        pointerEvents:'none',
      }} />

      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{
          width:68, height:68, borderRadius:22, margin:'0 auto 16px',
          background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 0 40px rgba(124,58,237,.5), 0 0 80px rgba(124,58,237,.15)',
        }}>
          <Zap size={30} color="white" fill="white" />
        </div>
        <h1 style={{ fontSize:30, fontWeight:800, color:'var(--txt)', letterSpacing:'-0.5px' }}>SoCart</h1>
        <p style={{ fontSize:13, color:'var(--accent-text)', fontWeight:600, marginTop:4 }}>Admin Panel</p>
      </div>

      <div style={{
        width:'100%', maxWidth:320, borderRadius:24, padding:'28px 22px', textAlign:'center',
        background:'var(--s1)', border:'1px solid var(--bdr2)',
        boxShadow:'0 24px 64px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04)',
      }}
      className="anim-scalein">
        {st === 'loading' && (
          <>
            <Loader2 size={38} color="#7c3aed" className="anim-spin" style={{ margin:'0 auto 14px' }} />
            <p style={{ fontWeight:700, fontSize:16, color:'var(--txt)' }}>Verifying</p>
            <p style={{ fontSize:13, color:'var(--txt2)', marginTop:6 }}>Checking your Telegram identity...</p>
          </>
        )}
        {st === 'ok' && (
          <>
            <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--green-lt)', border:'1px solid rgba(16,185,129,.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <ShieldCheck size={24} color="var(--green)" />
            </div>
            <p style={{ fontWeight:700, fontSize:16, color:'var(--txt)' }}>Access Granted!</p>
            <p style={{ fontSize:13, color:'var(--txt2)', marginTop:6 }}>Redirecting to dashboard...</p>
          </>
        )}
        {st === 'err' && (
          <>
            <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--red-lt)', border:'1px solid rgba(239,68,68,.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <AlertCircle size={24} color="var(--red)" />
            </div>
            <p style={{ fontWeight:700, fontSize:16, color:'var(--txt)' }}>Access Denied</p>
            <p style={{ fontSize:13, color:'#f87171', marginTop:6 }}>{msg}</p>
          </>
        )}
        {st === 'notg' && (
          <>
            <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--amber-lt)', border:'1px solid rgba(245,158,11,.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <AlertCircle size={24} color="var(--amber)" />
            </div>
            <p style={{ fontWeight:700, fontSize:16, color:'var(--txt)' }}>Open via Telegram</p>
            <p style={{ fontSize:13, color:'var(--txt2)', marginTop:8, lineHeight:1.7 }}>
              Send <code style={{ background:'var(--accent-lt)', color:'var(--accent-text)', padding:'1px 7px', borderRadius:6, fontWeight:700 }}>/admin</code> to the bot and tap the button
            </p>
          </>
        )}
      </div>
    </div>
  )
}
