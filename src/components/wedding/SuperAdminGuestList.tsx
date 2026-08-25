'use client'
import { useState, useMemo } from 'react'
import { Search, Users } from 'lucide-react'

interface Guest {
  id: string
  name: string
  category: string
  phone: string | null
  rsvp_status: string
  invite_status: string
  seating_assignments: { reception_tables: { name: string } | null }[]
}

const RSVP_STYLES: Record<string, string> = {
  yes: 'bg-green-50 text-green-700',
  yes_joy: 'bg-green-50 text-green-700',
  no: 'bg-red-50 text-red-500',
  from_afar: 'bg-blue-50 text-blue-600',
  pending: 'bg-gray-100 text-gray-500',
}

export default function SuperAdminGuestList({
  guests, coupleNames,
}: { guests: Guest[]; coupleNames: string }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return guests
    return guests.filter(g =>
      g.name.toLowerCase().includes(q) || (g.phone || '').includes(q)
    )
  }, [guests, search])

  const getTableName = (g: Guest) => g.seating_assignments?.[0]?.reception_tables?.name || null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Guest List</h1>
        <p className="text-gray-500 text-sm mt-1">
          {coupleNames} · {guests.length} guest{guests.length !== 1 ? 's' : ''} · read-only
        </p>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="text-left border-b border-gray-100 bg-gray-50">
                {['Guest', 'Category', 'Phone', 'RSVP', 'Table'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(g => (
                <tr key={g.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{g.name}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-sm capitalize">{g.category}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-sm">{g.phone || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${RSVP_STYLES[g.rsvp_status] || RSVP_STYLES.pending}`}>
                      {g.rsvp_status === 'pending' ? 'No response' : g.rsvp_status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {getTableName(g) || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p>{guests.length === 0 ? 'No guests yet' : 'No matches'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
