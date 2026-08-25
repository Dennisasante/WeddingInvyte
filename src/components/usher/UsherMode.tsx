'use client'
import { useState, useMemo } from 'react'
import { Search, Headphones, Users2 } from 'lucide-react'

interface Guest {
  id: string
  name: string
  phone: string | null
  category: string
  is_plus_one_of: string | null
  seating_assignments: { reception_tables: { name: string } | null }[]
}

const CATEGORY_LABEL: Record<string, string> = {
  couple: 'Couple (2 seats)',
  plus_one: 'Plus-one guest',
  individual: 'Individual',
}

export default function UsherMode({ guests }: { guests: Guest[] }) {
  const [query, setQuery] = useState('')

  const digits = query.replace(/\D/g, '')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2 && digits.length < 3) return []

    return guests
      .filter(g => {
        const nameMatch = q.length >= 2 && g.name.toLowerCase().includes(q)
        const phoneMatch = digits.length >= 3 && g.phone && g.phone.replace(/\D/g, '').includes(digits)
        return nameMatch || phoneMatch
      })
      .slice(0, 30)
  }, [guests, query, digits])

  const getTableName = (g: Guest) => g.seating_assignments?.[0]?.reception_tables?.name || null

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Headphones size={20} className="text-amber-500" />
        <h1 className="text-xl font-bold text-gray-800">Usher Mode</h1>
      </div>
      <p className="text-gray-500 text-sm mb-5">
        Search by name or phone number — for guests who get stuck at the door.
      </p>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
          placeholder="Name or phone number..."
          className="w-full pl-11 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-300"
        />
      </div>

      {query.trim().length >= 2 || digits.length >= 3 ? (
        <div className="space-y-2">
          {results.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No matches.</p>
          )}
          {results.map(g => {
            const table = getTableName(g)
            return (
              <div
                key={g.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{g.name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Users2 size={11} />
                    {CATEGORY_LABEL[g.category] || g.category}
                    {g.is_plus_one_of && ' · plus-one'}
                  </p>
                </div>
                <div
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold ${
                    table ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-500'
                  }`}
                >
                  {table || 'No table'}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-300 text-center py-12">
          Start typing a name or phone number
        </p>
      )}
    </div>
  )
}
