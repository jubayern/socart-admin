'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Package, Grid3X3,
  Users, Megaphone, Tag, Settings, LogOut, ShieldCheck, ChevronDown
} from 'lucide-react'
import { getRole, clearSession, getTgId } from '../lib/api'
import { useEffect, useState } from 'react'

const MENU = [
  { href: '/dashboard',  label: 'Dashboard',  Icon: LayoutDashboard, roles: ['admin','root'] },
  { href: '/orders',     label: 'Orders',     Icon: ShoppingBag,     roles: ['admin','root'] },
  { href: '/products',   label: 'Products',   Icon: Package,         roles: ['admin','root'] },
  { href: '/categories', label: 'Categories', Icon: Grid3X3,         roles: ['admin','root'] },
  { href: '/users',      label: 'Users',      Icon: Users,           roles: ['admin','root'] },
  { href: '/coupons',    label: 'Coupons',    Icon: Tag,             roles: ['admin','root'] },
  { href: '/broadcast',  label: 'Broadcast',  Icon: Megaphone,       roles: ['admin','root'] },
  { href: '/settings',   label: 'Settings',   Icon: Settings,        roles: ['admin','root'] },
  { href: '/admins',     label: 'Admins',     Icon: ShieldCheck,     roles: ['root']        },
]

// Bottom nav shows only top 5 most used
const BOTTOM_TABS = ['/dashboard', '/orders', '/products', '/categories', '/settings']

export default function Layout({ children, title }: { children: React.ReactNode; title?: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [role, setRole]   = useState('')
  const [showMore, setShowMore] = useState(false)

  useEffect(() => { setRole(getRole()) }, [])

  const logout = () => { clearSession(); router.push('/') }
  const allowed = MENU.filter(m => m.roles.includes(role))
  const bottomItems = allowed.filter(m => BOTTOM_TABS.includes(m.href))
  const moreItems   = allowed.filter(m => !BOTTOM_TABS.includes(m.href))

  const pageTitle = MENU.find(m => m.href === pathname)?.label || title || 'Admin'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <ShoppingBag size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm leading-none">SoCart</p>
            <p className="text-[10px] text-slate-400 capitalize">{role} panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-slate-700">{pageTitle}</h1>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-auto pb-24">
        {children}
      </main>

      {/* More Menu Overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-16 right-0 left-0 bg-white border-t border-slate-100 shadow-xl rounded-t-2xl p-3"
            onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-4 gap-1 mb-2">
              {moreItems.map(({ href, label, Icon }) => (
                <Link key={href} href={href} onClick={() => setShowMore(false)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition
                    ${pathname === href ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <Icon size={20} strokeWidth={1.8} />
                  <span className="text-[10px] font-medium">{label}</span>
                </Link>
              ))}
              <button onClick={() => { setShowMore(false); logout() }}
                className="flex flex-col items-center gap-1 p-3 rounded-xl text-rose-400 hover:bg-rose-50 transition">
                <LogOut size={20} strokeWidth={1.8} />
                <span className="text-[10px] font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100">
        <div className="flex">
          {bottomItems.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition
                  ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-b-full" />}
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
          {/* More button */}
          <button onClick={() => setShowMore(!showMore)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition
              ${showMore ? 'text-blue-600' : 'text-slate-400'}`}>
            <ChevronDown size={20} strokeWidth={1.8} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
