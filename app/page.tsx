'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'
import { api, getTg } from '../lib/api'

export default function AuthPage() {
  const router = useRouter()
  const [state, setState] = useState<'loading'|'ok'|'err'|'notg'>('loading')
  const [msg, setMsg]     = useState('')

  useEffect(() => {
    const tg = getTg()
    if (!tg?.initData) { setState('notg'); return }
    tg.ready(); tg.expand()
    api.post('/api/admin/login', { init_data: tg.initData })
      .then(r => {
        localStorage.setItem('admin_token', r.data.token)
        localStorage.setItem('admin_role',  r.data.role)
        localStorage.setItem('admin_tgid',  String(r.data.telegram_id))
        setState('ok')
        setTimeout(() => router.replace('/dashboard'), 800)
      })
      .catch(e => {
        setMsg(e?.response?.data?.detail || 'Access denied')
        setState('err')
      })
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1d4ed8 100%)' }}>

      {/* Logo */}
      <div className="mb-8">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <ShoppingCart size={36} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white text-center" style={{ fontFamily: 'Sora, sans-serif' }}>SoCart</h1>
        <p className="text-indigo-200 text-center text-sm mt-1">Admin Panel</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-xs rounded-3xl p-8 text-center shadow-2xl"
        style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>

        {state === 'loading' && (
          <>
            <Loader2 size={40} className="text-white animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold">Verifying...</p>
            <p className="text-indigo-200 text-sm mt-1">Checking your Telegram identity</p>
          </>
        )}

        {state === 'ok' && (
          <>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(34,197,94,0.2)' }}>
              <ShieldCheck size={28} className="text-green-400" />
            </div>
            <p className="text-white font-bold text-lg">Welcome!</p>
            <p className="text-indigo-200 text-sm mt-1">Redirecting to dashboard...</p>
          </>
        )}

        {state === 'err' && (
          <>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239,68,68,0.2)' }}>
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <p className="text-white font-bold text-lg">Access Denied</p>
            <p className="text-red-300 text-sm mt-1">{msg}</p>
          </>
        )}

        {state === 'notg' && (
          <>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(251,191,36,0.2)' }}>
              <AlertCircle size={28} className="text-yellow-400" />
            </div>
            <p className="text-white font-bold text-lg">Open via Telegram</p>
            <p className="text-indigo-200 text-sm mt-2 leading-relaxed">
              Send <span className="font-mono font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">/admin</span> to the bot and tap the button
            </p>
          </>
        )}
      </div>

      <p className="text-indigo-400 text-xs mt-8">SoCart v3.0</p>
    </div>
  )
}
