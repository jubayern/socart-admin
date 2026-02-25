'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, ShoppingBag, Package, Grid3X3, Users, Tag, Megaphone, Settings, ShieldCheck, LogOut, MoreHorizontal, X, Zap, Image, Coins, LifeBuoy, Landmark, RotateCcw } from 'lucide-react'
import { getRole, clearSession } from '../lib/api'
import Toaster from './Toaster'

const TABS = [
  { href:'/dashboard',  Icon:LayoutDashboard, label:'Home'     },
  { href:'/orders',     Icon:ShoppingBag,      label:'Orders'   },
  { href:'/products',   Icon:Package,          label:'Products' },
  { href:'/categories', Icon:Grid3X3,          label:'Cats'     },
]
const EXTRAS = [
  { href:'/banners',   Icon:Image,      label:'Banners',   roles:['admin','root'] },
  { href:'/announcements', Icon:Megaphone, label:'Announce', roles:['admin','root'] },
  { href:'/coins',     Icon:Coins,      label:'Coins',     roles:['admin','root'] },
  { href:'/support',   Icon:LifeBuoy,   label:'Support',   roles:['admin','root'] },
  { href:'/withdrawals', Icon:Landmark, label:'Withdraw',  roles:['admin','root'] },
  { href:'/returns',   Icon:RotateCcw,  label:'Returns',   roles:['admin','root'] },
  { href:'/users',     Icon:Users,       label:'Users',     roles:['admin','root'] },
  { href:'/coupons',   Icon:Tag,         label:'Coupons',   roles:['admin','root'] },
  { href:'/broadcast', Icon:Megaphone,   label:'Broadcast', roles:['admin','root'] },
  { href:'/settings',  Icon:Settings,    label:'Settings',  roles:['admin','root'] },
  { href:'/admins',    Icon:ShieldCheck, label:'Admins',    roles:['root']         },
]

export default function Shell({ children }: { children: React.ReactNode }) {
  const path   = usePathname()
  const router = useRouter()
  const [role, setRole]     = useState('')
  const [drawer, setDrawer] = useState(false)

  useEffect(() => { setRole(getRole()) }, [])

  const logout   = () => { clearSession(); router.push('/') }
  const extras   = EXTRAS.filter(m => m.roles.includes(role))
  const allItems = [...TABS, ...extras]
  const title    = allItems.find(m => m.href === path)?.label || ''
  const inExtras = extras.some(m => m.href === path)

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'var(--base)' }}>
      <Toaster />

      {/* Header */}
      <header style={{
        position:'sticky', top:0, zIndex:40,
        background:'rgba(8,12,24,0.88)',
        backdropFilter:'blur(20px)',
        borderBottom:'1px solid var(--bdr)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 16px', height:54,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:10, flexShrink:0,
            background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 16px rgba(124,58,237,0.5)',
          }}>
            <Zap size={15} color="white" fill="white" />
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:800, color:'var(--txt)', letterSpacing:'-0.3px', lineHeight:1 }}>SoCart</p>
            <p style={{ fontSize:10, color:'var(--accent-text)', fontWeight:600, textTransform:'capitalize', lineHeight:1, marginTop:2 }}>{role}</p>
          </div>
        </div>
        {title && (
          <span style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', fontSize:14, fontWeight:700, color:'var(--txt)' }}>{title}</span>
        )}
        <button onClick={() => setDrawer(true)} style={{
          width:34, height:34, borderRadius:9, cursor:'pointer',
          background:'var(--s2)', border:'1px solid var(--bdr2)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <MoreHorizontal size={17} color="var(--txt2)" />
        </button>
      </header>

      {/* Content */}
      <main style={{ flex:1, overflowY:'auto', paddingBottom:76 }}>
        {children}
      </main>

      {/* Bottom nav */}
      <nav style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:40,
        background:'rgba(8,12,24,0.94)',
        backdropFilter:'blur(24px)',
        borderTop:'1px solid var(--bdr)',
        display:'flex',
      }}>
        {TABS.map(({ href, Icon, label }) => {
          const a = path === href
          return (
            <Link key={href} href={href} style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', padding:'10px 0 12px', gap:3,
              color: a ? 'var(--accent-text)' : 'var(--txt3)',
              textDecoration:'none', position:'relative',
            }}
            className={a ? 'nav-glow' : ''}>
              <Icon size={20} strokeWidth={a ? 2.3 : 1.8} />
              <span style={{ fontSize:10, fontWeight: a ? 700 : 500 }}>{label}</span>
            </Link>
          )
        })}
        <button onClick={() => setDrawer(true)} style={{
          flex:1, display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', padding:'10px 0 12px', gap:3,
          color: inExtras ? 'var(--accent-text)' : 'var(--txt3)',
          background:'transparent', border:'none', cursor:'pointer', position:'relative',
        }}
        className={inExtras ? 'nav-glow' : ''}>
          <MoreHorizontal size={20} strokeWidth={1.8} />
          <span style={{ fontSize:10, fontWeight:500 }}>More</span>
        </button>
      </nav>

      {/* Drawer */}
      {drawer && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', justifyContent:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.65)', backdropFilter:'blur(6px)' }} onClick={() => setDrawer(false)} />
          <div className="anim-slideinr" style={{
            position:'relative', width:272, display:'flex', flexDirection:'column',
            background:'var(--s1)', borderLeft:'1px solid var(--bdr2)',
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 14px', height:54, borderBottom:'1px solid var(--bdr)' }}>
              <p style={{ fontWeight:700, fontSize:14, color:'var(--txt)' }}>Menu</p>
              <button onClick={() => setDrawer(false)} style={{ width:30, height:30, borderRadius:8, background:'var(--s3)', border:'1px solid var(--bdr)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <X size={14} color="var(--txt2)" />
              </button>
            </div>
            <nav style={{
              flex: 1,
              padding: '10px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
            }}>
              {allItems.map(({ href, Icon, label }) => {
                const a = path === href
                return (
                  <Link key={href} href={href} onClick={() => setDrawer(false)} style={{
                    display:'flex', alignItems:'center', gap:11, padding:'11px 13px', borderRadius:11,
                    textDecoration:'none', fontSize:14, fontWeight: a ? 700 : 500,
                    background: a ? 'var(--accent-lt)' : 'transparent',
                    border: `1px solid ${a ? 'rgba(124,58,237,.2)' : 'transparent'}`,
                    color: a ? 'var(--accent-text)' : 'var(--txt2)',
                  }}>
                    <Icon size={16} strokeWidth={a ? 2.2 : 1.8} />
                    {label}
                  </Link>
                )
              })}
            </nav>
            <div style={{ padding:'8px 8px calc(28px + env(safe-area-inset-bottom, 0px))', borderTop:'1px solid var(--bdr)' }}>
              <button onClick={logout} style={{
                width:'100%', display:'flex', alignItems:'center', gap:11,
                padding:'11px 13px', borderRadius:11, cursor:'pointer',
                background:'var(--red-lt)', border:'1px solid rgba(239,68,68,.15)',
                color:'#f87171', fontSize:14, fontWeight:600,
              }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
