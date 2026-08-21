'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, Search, ArrowLeft } from 'lucide-react'
import BrandFooter from '@/components/BrandFooter'
import SeatResultCard from './SeatResultCard'

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
}

interface SeatResult {
  error?: 'not_found' | 'inactive' | 'not_seated'
  guest_name?: string
  table_name?: string
}

export default function SeatFinder({ wedding }: { wedding: Wedding }) {
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
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
      setSearching(false)
    }, 350)

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
  }

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
              className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition mt-2 mx-auto"
            >
              <ArrowLeft size={12} />
              Search another name
            </button>
          </>
        ) : (
          <>
            <h1 className="text-lg font-bold text-gray-800 mt-4 mb-4">
              Find your seat
            </h1>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
                placeholder="Type your name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>

            <div className="mt-3 space-y-1.5 text-left">
              {searching && (
                <p className="text-xs text-gray-400 text-center py-2">Searching...</p>
              )}
              {!searching && query.trim().length >= 2 && matches.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">
                  No match — check the spelling, or ask the couple.
                </p>
              )}
              {matches.map(m => (
                <button
                  key={m.id}
                  onClick={() => selectGuest(m.id)}
                  disabled={loadingResult}
                  className="w-full text-left px-4 py-2.5 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition text-sm text-gray-700 disabled:opacity-50"
                >
                  {m.name}
                </button>
              ))}
            </div>
          </>
        )}

        <BrandFooter />
      </div>
    </div>
  )
}
