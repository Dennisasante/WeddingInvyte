'use client'
import Link from 'next/link'
import { Heart, Users, CheckCircle, Plus } from 'lucide-react'

interface Props {
  profile: { full_name: string | null; role: string }
  weddings: {
    id: string
    couple_names: string
    event_date: string | null
    is_active: boolean
    created_at: string
  }[]
  guests: { id: string; wedding_id: string; rsvp_status: string }[]
}

export default function SuperAdminDashboard({ profile, weddings, guests }: Props) {
  const totalGuests = guests.length
  const respondedGuests = guests.filter(g => g.rsvp_status !== 'pending').length
  const attendingGuests = guests.filter(g =>
    g.rsvp_status === 'yes' || g.rsvp_status === 'yes_joy'
  ).length
  const activeWeddings = weddings.filter(w => w.is_active).length
  const rsvpRate = totalGuests > 0
    ? Math.round((respondedGuests / totalGuests) * 100)
    : 0

  const firstName = profile.full_name?.split(' ')[0] || 'Admin'

  const stats = [
    { label: 'Total Weddings', value: weddings.length, sub: `${activeWeddings} active`, icon: Heart },
    { label: 'Total Guests', value: totalGuests, sub: 'across all weddings', icon: Users },
    { label: 'RSVP Rate', value: `${rsvpRate}%`, sub: `${respondedGuests} responded`, icon: CheckCircle },
    { label: 'Attending', value: attendingGuests, sub: 'confirmed guests', icon: Users },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Good day, {firstName} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Here's what's happening across all weddings.
          </p>
        </div>
        <Link
          href="/dashboard/weddings/new"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          <Plus size={16} />
          New Wedding
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{label}</p>
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <Icon size={18} className="text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Weddings Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">All Weddings</h2>
          <Link href="/dashboard/weddings" className="text-sm text-amber-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                {['Couple', 'Date', 'Guests', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {weddings.map(wedding => {
                const weddingGuests = guests.filter(g => g.wedding_id === wedding.id)
                return (
                  <tr key={wedding.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {wedding.couple_names}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {wedding.event_date
                        ? new Date(wedding.event_date).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {weddingGuests.length}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        wedding.is_active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {wedding.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/weddings/${wedding.id}`}
                        className="text-sm text-amber-600 hover:underline font-medium"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {weddings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <Heart size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No weddings yet. Create the first one!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}