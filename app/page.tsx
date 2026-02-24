'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag, ShieldCheck, AlertCircle, Loader } from 'lucide-react'
import { api, getTelegramWebApp } from '../lib/api'

type S = 'loading' | 'success' | 'error' | 'no_telegram'

export default function AuthPage() {
  const router = useRouter()
  const [state, setState] = useState<S>('loading')
  const [error, setError] = useState('')
  const [name, setName]   = useState('')

  useEffect(() => { authenticate() }, [])

  const authenticate = async () => {
    const tg = getTelegramWebApp()
    if (!tg || !tg.initData) { setState('no_telegram'); return }
    tg.ready(); tg.expand()
    try {
      const r = await api.post('/api/admin/login', { init_data: tg.initData })
      localStorage.setItem('admin_token', r.data.token)
      localStorage.setItem('admin_role',  r.data.role)
      localStorage.setItem('admin_tgid',  String(r.data.telegram_id))
      setName(r.data.name || ''); setState('success')
      setTimeout(() => router.push('/dashboard'), 900)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Authentication failed')
      setState('error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mb-5">
        <ShoppingBag size={30} className="text-white" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-1">SoCart Admin</h1>
      <p className="text-slate-400 text-sm mb-8">Admin Panel</p>

      <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-8 text-center">
        {state === 'loading' && (
          <>
            <Loader size={36} className="text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Verifying identity...</p>
          </>
        )}
        {state === 'success' && (
          <>
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={28} className="text-green-400" />
            </div>
            <p className="text-white font-semibold">Welcome, {name}!</p>
            <p className="text-slate-400 text-sm mt-1">Redirecting...</p>
          </>
        )}
        {state === 'error' && (
          <>
            <div className="w-14 h-14 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-rose-400" />
            </div>
            <p className="text-white font-semibold">Access Denied</p>
            <p className="text-rose-400 text-sm mt-1">{error}</p>
          </>
        )}
        {state === 'no_telegram' && (
          <>
            <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-amber-400" />
            </div>
            <p className="text-white font-semibold">Open via Telegram</p>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Send <span className="text-blue-400 font-mono font-bold">/admin</span> to the bot and tap the button.
            </p>
          </>
        )}
      </div>
      <p className="text-slate-700 text-xs mt-6">SoCart v2.0</p>
    </div>
  )
}
