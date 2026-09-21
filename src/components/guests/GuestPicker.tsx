'use client'
import { useState } from 'react'
import { Search, X } from 'lucide-react'

export interface PickableGuest {
  id: string
  name: string
  category: string
  is_plus_one_of?: string | null
  partner_id?: string | null
}

interface Props {
  // Guests that can be chosen (already filtered by the caller)
  candidates: PickableGuest[]
  // Used to show the name of the current selection
  allGuests: PickableGuest[]
  value: string | null
  onChange: (guestId: string | null) => void
  placeholder: string
  selectedPrefix: string
  emptyHint?: string
}

// Search-and-pick for linking one guest to another (plus one of…, partner…).
export default function GuestPicker({
  candidates, allGuests, value, onChange, placeholder, selectedPrefix, emptyHint,
}: Props) {
  const [query, setQuery] = useState('')

  const selected = allGuests.find(g => g.id === value)

  const q = query.trim().toLowerCase()
  const matches = q.length < 2
    ? []
    : candidates.filter(g => g.name.toLowerCase().includes(q)).slice(0, 6)

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border border-purple-100 bg-purple-50 rounded-xl text-sm">
        <span className="text-purple-800 truncate">{selectedPrefix} <strong>{selected.name}</strong></span>
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
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white"
        />
      </div>
      {q.length >= 2 && (
        <div className="mt-1.5 border border-gray-100 rounded-xl divide-y divide-gray-50 overflow-hidden bg-white">
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
              {emptyHint || 'No match'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
