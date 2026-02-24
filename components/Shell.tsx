'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, ShoppingBag, Package, Grid3X3,
  Users, Tag, Megaphone, Settings, ShieldCheck,
  LogOut, MoreHorizontal, X, ShoppingCart
} from 'lucide-react'
import { getRole, clearSession } from '../lib/api'

const BOTTOM = [
  { href: '/dashboard',  Icon: LayoutDashboard, label: 'Home'     },
  { href: '/orders',     Icon: ShoppingBag,      label: 'Orders'   },
  { href: '/products',   Icon: Package,          label: 'Products' },
  { href: '/categories', Icon: Grid3X3,          label: 'Categories'     },
]

const DRAWER_ITEMS = [
  { href: '/users',     Icon: Users,       label: 'Users',    roles: ['admin','root'] },
  { href: '/coupons',   Icon: Tag,         label: 'Coupons',  roles: ['admin','root'] },
  { href: '/broadcast', Icon: Megaphone,   label: 'Broadcast',roles: ['admin','root'] },
  { href: '/settings',  Icon: Settings,    label: 'Settings', roles: ['admin','root'] },
  { href: '/admins',    Icon: ShieldCheck, label: 'Admins',   roles: ['root']         },
]

export default function Shell({ children, title }: { children: React.ReactNode; title?: string }) {
  const path   = usePathname()
  const router = useRouter()
  const [role, setRole]     = useState('')
  const [drawer, setDrawer] = useState(false)

  useEffect(() => { setRole(getRole()) }, [])

  const logout = () => { clearSession(); router.push('/') }
  const drawerItems = DRAWER_ITEMS.filter(m => m.roles.includes(role))
  const allItems    = [...BOTTOM, ...drawerItems]
  const pageTitle   = allItems.find(m => m.href === path)?.label || title || ''

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header className="sticky top-0 z-30" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand)' }}>
              <ShoppingCart size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none" style={{ color: 'var(--text)' }}>SoCart</p>
              <p className="text-[10px]" style={{ color: 'var(--muted)' }}>Admin Panel</p>
            </div>
          </div>
          {pageTitle && (
            <p className="text-sm font-semibold absolute left-1/2 -translate-x-1/2" style={{ color: 'var(--text)' }}>{pageTitle}</p>
          )}
          <button onClick={() => setDrawer(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--bg)', color: 'var(--muted)' }}>
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>

      {/* Page */}
      <main className="flex-1 overflow-auto" style={{ paddingBottom: '80px' }}>
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30" style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
        <div className="flex" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {BOTTOM.map(({ href, Icon, label }) => {
            const active = path === href
            return (
              <Link key={href} href={href}
                className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative"
                style={{ color: active ? 'var(--brand)' : 'var(--muted)' }}>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full" style={{ background: 'var(--brand)' }} />
                )}
                <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            )
          })}
          <button onClick={() => setDrawer(true)}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5"
            style={{ color: drawerItems.some(m => m.href === path) ? 'var(--brand)' : 'var(--muted)' }}>
            <MoreHorizontal size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold">More</span>
          </button>
        </div>
      </nav>

      {/* Drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="relative w-72 flex flex-col shadow-2xl" style={{ background: 'var(--card)' }}>
            <div className="flex items-center justify-between px-5 h-14" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>Menu</p>
              <button onClick={() => setDrawer(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--bg)', color: 'var(--muted)' }}>
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-3 py-3 space-y-1">
              {[...BOTTOM, ...drawerItems].map(({ href, Icon, label }) => (
                <Link key={href} href={href} onClick={() => setDrawer(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all"
                  style={{
                    background: path === href ? 'var(--brand)' : 'transparent',
                    color: path === href ? 'white' : 'var(--text)'
                  }}>
                  <Icon size={18} strokeWidth={1.8} />
                  {label}
                </Link>
              ))}
            </div>

            <div className="px-3 pb-8 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <button onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold"
                style={{ color: 'var(--danger)' }}>
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
