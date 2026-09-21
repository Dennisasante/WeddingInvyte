'use client'
import { useState } from 'react'
import { Search, X } from 'lucide-react'

export interface PickableGuest {
  id: string
  name: string
  category: string
  is_plus_one_of?: string | null
}

interface Props {
  guests: PickableGuest[]
  value: string | null
  onChange: (guestId: string | null) => void
  excludeId?: string
}

// Picks which guest a plus one belongs to. A guest can only have one plus
// one, so hosts who already have one (other than the one being edited) are
// left out.
export default function PlusOnePicker({ guests, value, onChange, excludeId }: Props) {
  const [query, setQuery] = useState('')

  const hostsWithPlusOne = new Set(
    guests
      .filter(g => g.category === 'plus_one' && g.is_plus_one_of && g.id !== excludeId)
      .map(g => g.is_plus_one_of as string)
  )

  const selected = guests.find(g => g.id === value)

  const q = query.trim().toLowerCase()
  const matches = q.length < 2
    ? []
    : guests
        .filter(g =>
          g.category !== 'plus_one' &&
          g.id !== excludeId &&
          !hostsWithPlusOne.has(g.id) &&
          g.name.toLowerCase().includes(q)
        )
        .slice(0, 6)

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border border-purple-100 bg-purple-50 rounded-xl text-sm">
        <span className="text-purple-800 truncate">+1 of <strong>{selected.name}</strong></span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-purple-400 hover:text-purple-700 flex-shrink-0"
          title="Unlink"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for the guest they're coming with..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>
      {q.length >= 2 && (
        <div className="mt-1.5 border border-gray-100 rounded-xl divide-y divide-gray-50 overflow-hidden">
          {matches.map(g => (
            <button
              key={g.id}
              type="button"
              onClick={() => { onChange(g.id); setQuery('') }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 transition"
            >
              {g.name}
            </button>
          ))}
          {matches.length === 0 && (
            <p className="px-4 py-2 text-xs text-gray-400">
              No match (guests who already have a plus one aren't listed)
            </p>
          )}
        </div>
      )}
    </div>
  )
}
