'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Menu, X, LayoutDashboard, Users, Mail, Heart,
  ClipboardList, Table2, QrCode, Settings,
  LogOut, Activity, MessageSquare
} from 'lucide-react'

interface Profile {
  id: string
  role: string
  full_name: string | null
  wedding_id: string | null
}

export default function MobileNav({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const isSuperAdmin = profile.role === 'super_admin'

  const superAdminLinks = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/weddings', label: 'All Weddings', icon: Heart },
    { href: '/dashboard/admins', label: 'Couple Admins', icon: Users },
    { href: '/dashboard/activity', label: 'Activity Log', icon: Activity },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  const coupleAdminLinks = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/wedding', label: 'Wedding Details', icon: Heart },
    { href: '/dashboard/guests', label: 'Guest List', icon: Users },
    { href: '/dashboard/rsvp', label: 'RSVP Manager', icon: ClipboardList },
    { href: '/dashboard/tables', label: 'Seating', icon: Table2 },
    { href: '/dashboard/invites', label: 'Invitations', icon: Mail },
    { href: '/dashboard/messages', label: 'Guest Messages', icon: MessageSquare },
    { href: '/dashboard/checkin', label: 'Check-In', icon: QrCode },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  const links = isSuperAdmin ? superAdminLinks : coupleAdminLinks

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">💍</span>
          <span className="font-bold text-gray-800 text-sm">WeddingInvite</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Drawer Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">💍</span>
            <div>
              <p className="font-bold text-gray-800 text-sm">WeddingInvite</p>
              <p className="text-xs text-amber-600">
                {isSuperAdmin ? 'Super Admin' : 'Couple Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-sm font-bold text-amber-800">
              {(profile.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {profile.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-400">
                {isSuperAdmin ? 'Super Admin' : 'Couple Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </>
  )
}