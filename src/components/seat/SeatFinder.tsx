'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, Search, ArrowLeft } from 'lucide-react'
import BrandFooter from '@/components/BrandFooter'
import SeatResultCard from './SeatResultCard'
import AskUsherNote from './AskUsherNote'

interface Wedding {
  id: string
  couple_names: string
  primary_color: string
  secondary_color: string
  accent_color: string
  venue_name: string | null
  event_date: string | null
}

interface Match {
  id: string
  name: string
  table_name: string | null
  phone_masked: string | null
}

interface SeatResult {
  error?: 'not_found' | 'inactive' | 'not_seated'
  guest_name?: string
  table_name?: string
}

export default function SeatFinder({ wedding }: { wedding: Wedding }) {
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [searched, setSearched] = useState(false)
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<SeatResult | null>(null)
  const [loadingResult, setLoadingResult] = useState(false)
  const supabase = createClient()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const primary = wedding.primary_color || '#D4A373'
  const secondary = wedding.secondary_color || '#FEFAE0'

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 2) {
      setMatches([])
      setSearched(false)
      setSearching(false)
      return
    }

    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      const { data } = await supabase.rpc('search_guests_by_name', {
        p_wedding_id: wedding.id,
        p_query: query.trim(),
      })
      setMatches(data?.matches || [])
      setSearched(true)
      setSearching(false)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, wedding.id, supabase])

  const selectGuest = async (guestId: string) => {
    setLoadingResult(true)
    const { data } = await supabase.rpc('get_seat_by_guest_id', {
      p_wedding_id: wedding.id,
      p_guest_id: guestId,
    })
    setResult(data || { error: 'not_found' })
    setLoadingResult(false)
  }

  const reset = () => {
    setResult(null)
    setQuery('')
    setMatches([])
    setSearched(false)
  }

  // Only show a masked phone when a name collides with another match —
  // keeps the common case (unique name) clean, per the spec's examples.
  const nameCounts = matches.reduce<Record<string, number>>((acc, m) => {
    const key = m.name.trim().toLowerCase()
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: secondary }}
    >
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <Heart size={22} style={{ color: primary }} className="mx-auto mb-3" fill={primary} />
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
          {wedding.couple_names}
        </p>

        {result ? (
          <>
            <SeatResultCard
              guestName={result.guest_name}
              tableName={result.table_name}
              notSeated={result.error === 'not_seated'}
              primary={primary}
              eventDate={wedding.event_date}
              venueName={wedding.venue_name}
            />
            <button
              onClick={reset}
              className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition mt-4 mx-auto"
            >
              <ArrowLeft size={12} />
              Search another name
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-1.5">
              Find Your Table
            </h1>
            <p className="text-sm text-gray-500 mb-5">
              Enter your name or phone number to find your table.
            </p>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
                aria-label="Search your name or phone number"
                placeholder="Search your name or phone number"
                className="w-full pl-11 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-300"
              />
            </div>

            <div className="mt-4 space-y-2 text-left">
              {searching && (
                <p className="text-sm text-gray-400 text-center py-2">Searching...</p>
              )}

              {!searching && searched && matches.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-700 font-medium text-sm mb-1">
                    We couldn't find a match.
                  </p>
                  <p className="text-gray-400 text-xs mb-4">
                    Please check the spelling or number, or ask an usher for help.
                  </p>
                  <AskUsherNote prominent />
                </div>
              )}

              {matches.map(m => {
                const isDuplicate = nameCounts[m.name.trim().toLowerCase()] > 1
                return (
                  <button
                    key={m.id}
                    onClick={() => selectGuest(m.id)}
                    disabled={loadingResult}
                    className="w-full text-left px-4 py-3 rounded-xl border-2 border-gray-100 hover:border-amber-300 hover:bg-amber-50 transition disabled:opacity-50"
                  >
                    <p className="font-semibold text-gray-800">{m.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400">
                        {m.table_name || 'No table yet'}
                      </p>
                      {isDuplicate && m.phone_masked && (
                        <p className="text-xs text-gray-300">· {m.phone_masked}</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {!searched && <AskUsherNote />}
          </>
        )}

        <BrandFooter />
      </div>
    </div>
  )
}
