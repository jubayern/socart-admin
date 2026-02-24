'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

type T = { id: number; type: 'success'|'error'|'info'; message: string; out?: boolean }

const CFG = {
  success: { Icon: CheckCircle2, color: '#10b981', bg: 'linear-gradient(135deg,#052e1a,#064e3b)',  bdr: 'rgba(16,185,129,.25)' },
  error:   { Icon: XCircle,      color: '#f87171', bg: 'linear-gradient(135deg,#2d0a0a,#7f1d1d)',  bdr: 'rgba(239,68,68,.25)'  },
  info:    { Icon: Info,         color: '#a78bfa', bg: 'linear-gradient(135deg,#1a0a3d,#3b0764)',  bdr: 'rgba(124,58,237,.25)' },
}

export default function Toaster() {
  const [toasts, set] = useState<T[]>([])

  useEffect(() => {
    const h = (e: any) => {
      const id = Date.now() + Math.random()
      set(t => [...t, { id, ...e.detail }])
      setTimeout(() => {
        set(t => t.map(x => x.id === id ? { ...x, out: true } : x))
        setTimeout(() => set(t => t.filter(x => x.id !== id)), 400)
      }, 3500)
    }
    window.addEventListener('sc:toast', h)
    return () => window.removeEventListener('sc:toast', h)
  }, [])

  const dismiss = (id: number) => {
    set(t => t.map(x => x.id === id ? { ...x, out: true } : x))
    setTimeout(() => set(t => t.filter(x => x.id !== id)), 400)
  }

  if (!toasts.length) return null

  return (
    <div style={{ position:'fixed', top:12, left:12, right:12, zIndex:999, display:'flex', flexDirection:'column', gap:8, pointerEvents:'none' }}>
      {toasts.map(({ id, type, message, out }) => {
        const { Icon, color, bg, bdr } = CFG[type]
        return (
          <div key={id} style={{
            display:'flex', alignItems:'center', gap:10,
            padding:'12px 14px', borderRadius:14,
            background: bg, border: `1px solid ${bdr}`,
            boxShadow: `0 8px 32px rgba(0,0,0,.5), 0 0 0 1px ${bdr}`,
            animation: out ? 'toastOut .4s ease forwards' : 'toastIn .4s cubic-bezier(.34,1.56,.64,1) forwards',
            pointerEvents:'all',
          }}>
            <Icon size={17} color={color} style={{ flexShrink:0 }} />
            <p style={{ flex:1, fontSize:13, fontWeight:600, color:'#f1f5f9', lineHeight:1.4 }}>{message}</p>
            <button onClick={() => dismiss(id)} style={{ background:'none', border:'none', cursor:'pointer', opacity:.5, padding:2 }}>
              <X size={14} color="#f1f5f9" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
