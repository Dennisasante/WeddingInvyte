'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, UserCheck, Clock, Users, CheckCircle2, X } from 'lucide-react'

interface Guest {
  id: string
  name: string
  email: string | null
  category: string
  rsvp_status: string
  checked_in_at: string | null
  seating_assignments: {
    reception_tables: { name: string } | null
  }[]
}

interface Props {
  guests: Guest[]
  weddingId: string
}

export default function CheckInManager({ guests: initialGuests, weddingId }: Props) {
  const [guests, setGuests] = useState(initialGuests)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'checked_in' | 'not_checked_in'>('not_checked_in')
  const [checkingIn, setCheckingIn] = useState<string | null>(null)
  const [lastCheckedIn, setLastCheckedIn] = useState<Guest | null>(null)
  const supabase = createClient()

  const checkedInCount = guests.filter(g => g.checked_in_at).length
  const totalExpected = guests.filter(g =>
    g.rsvp_status === 'yes' || g.rsvp_status === 'yes_joy'
  ).length

  const filtered = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'all' ||
      (filter === 'checked_in' && g.checked_in_at) ||
      (filter === 'not_checked_in' && !g.checked_in_at)
    return matchesSearch && matchesFilter
  })

  const getTableName = (guest: Guest) => {
    return guest.seating_assignments?.[0]?.reception_tables?.name || null
  }

  const handleCheckIn = async (guest: Guest) => {
    if (guest.checked_in_at) return
    setCheckingIn(guest.id)

    const checkedInAt = new Date().toISOString()

    const { error } = await supabase
      .from('guests')
      .update({ checked_in_at: checkedInAt })
      .eq('id', guest.id)

    if (!error) {
      setGuests(prev => prev.map(g =>
        g.id === guest.id ? { ...g, checked_in_at: checkedInAt } : g
      ))
      setLastCheckedIn({ ...guest, checked_in_at: checkedInAt })
      setTimeout(() => setLastCheckedIn(null), 4000)
    }

    setCheckingIn(null)
  }

  const handleUndoCheckIn = async (guestId: string) => {
    await supabase
      .from('guests')
      .update({ checked_in_at: null })
      .eq('id', guestId)

    setGuests(prev => prev.map(g =>
      g.id === guestId ? { ...g, checked_in_at: null } : g
    ))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
                <UserCheck size={18} />
              </div>
              <div>
                <h1 className="font-bold text-white">Guest Check-In</h1>
                <p className="text-gray-400 text-xs">Wedding Day Mode</p>
              </div>
            </div>

            {/* Live counter */}
            <div className="text-right">
              <p className="text-3xl font-bold text-amber-400">{checkedInCount}</p>
              <p className="text-xs text-gray-400">
                of {totalExpected} expected arrived
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
            <div
              className="bg-amber-400 h-2 rounded-full transition-all duration-500"
              style={{
                width: totalExpected > 0
                  ? `${Math.min((checkedInCount / totalExpected) * 100, 100)}%`
                  : '0%'
              }}
            />
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search guest name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              className="w-full pl-11 pr-4 py-3.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-base"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {lastCheckedIn && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-pulse">
          <CheckCircle2 size={20} />
          <div>
            <p className="font-bold">{lastCheckedIn.name}</p>
            <p className="text-xs text-green-100">Checked in successfully!</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="max-w-2xl mx-auto px-6 py-4">
        <div className="flex gap-2 mb-4">
          {([
            { key: 'not_checked_in', label: 'Arriving', count: guests.filter(g => !g.checked_in_at).length },
            { key: 'checked_in', label: 'Arrived', count: checkedInCount },
            { key: 'all', label: 'All Guests', count: guests.length },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                filter === tab.key
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                filter === tab.key ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Guest List */}
        <div className="space-y-3">
          {filtered.map(guest => {
            const isCheckedIn = !!guest.checked_in_at
            const tableName = getTableName(guest)
            const isProcessing = checkingIn === guest.id

            return (
              <div
                key={guest.id}
                className={`rounded-2xl p-4 border transition ${
                  isCheckedIn
                    ? 'bg-green-900/30 border-green-800'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-bold truncate ${
                        isCheckedIn ? 'text-green-300' : 'text-white'
                      }`}>
                        {guest.name}
                      </p>
                      {guest.category === 'couple' && (
                        <span className="text-xs bg-purple-800 text-purple-200 px-2 py-0.5 rounded-full flex-shrink-0">
                          couple
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      {tableName && (
                        <span className="text-gray-400 flex items-center gap-1">
                          🪑 {tableName}
                        </span>
                      )}
                      {isCheckedIn && guest.checked_in_at && (
                        <span className="text-green-400 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(guest.checked_in_at).toLocaleTimeString('en-US', {
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      )}
                      <span className={`${
                        guest.rsvp_status === 'yes' || guest.rsvp_status === 'yes_joy'
                          ? 'text-green-400'
                          : guest.rsvp_status === 'pending'
                          ? 'text-amber-400'
                          : 'text-gray-500'
                      }`}>
                        RSVP: {guest.rsvp_status === 'yes' ? 'Attending' :
                               guest.rsvp_status === 'yes_joy' ? 'With Joy' :
                               guest.rsvp_status === 'pending' ? 'Pending' : guest.rsvp_status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {isCheckedIn ? (
                      <>
                        <CheckCircle2 size={24} className="text-green-400" />
                        <button
                          onClick={() => handleUndoCheckIn(guest.id)}
                          className="text-xs text-gray-500 hover:text-red-400 transition underline"
                        >
                          Undo
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(guest)}
                        disabled={isProcessing}
                        className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {isProcessing ? (
                          <span>...</span>
                        ) : (
                          <>
                            <UserCheck size={16} />
                            Check In
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Users size={40} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">
                {search ? `No guests matching "${search}"` : 'No guests in this list'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}