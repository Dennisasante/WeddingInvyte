'use client'
import { useEffect } from 'react'

interface Guest {
  id: string
  name: string
  email: string | null
  phone: string | null
  category: string
  rsvp_status: string
  dietary_restrictions: string | null
  seating_assignments: { reception_tables: { name: string } | null }[]
}

interface Wedding {
  couple_names: string
  event_date: string | null
  venue_name: string | null
}

interface Props {
  wedding: Wedding | null
  guests: Guest[]
}

const RSVP_LABELS: Record<string, string> = {
  pending: 'Pending',
  yes: 'Attending',
  yes_joy: 'Attending',
  no: 'Not Attending',
  from_afar: 'From Afar',
}

export default function PrintGuestList({ wedding, guests }: Props) {
  useEffect(() => {
    window.print()
  }, [])

  const attending = guests.filter(
    g => g.rsvp_status === 'yes' || g.rsvp_status === 'yes_joy'
  ).length
  const notAttending = guests.filter(
    g => g.rsvp_status === 'no' || g.rsvp_status === 'from_afar'
  ).length
  const pending = guests.filter(g => g.rsvp_status === 'pending').length

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {wedding?.couple_names}
        </h1>
        <p className="text-gray-500">Guest List</p>
        {wedding?.event_date && (
          <p className="text-gray-400 text-sm mt-1">
            {new Date(wedding.event_date).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric'
            })}
          </p>
        )}
        {wedding?.venue_name && (
          <p className="text-gray-400 text-sm">📍 {wedding.venue_name}</p>
        )}

        {/* Summary */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <span className="text-gray-600">
            <strong>{guests.length}</strong> Total
          </span>
          <span className="text-green-600">
            <strong>{attending}</strong> Attending
          </span>
          <span className="text-red-500">
            <strong>{notAttending}</strong> Not Attending
          </span>
          <span className="text-amber-600">
            <strong>{pending}</strong> Pending
          </span>
        </div>
      </div>

      {/* Guest Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
              #
            </th>
            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
              Name
            </th>
            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
              Type
            </th>
            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
              RSVP
            </th>
            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
              Table
            </th>
            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
              Dietary
            </th>
            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
              Contact
            </th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest, index) => {
            const tableName = guest.seating_assignments?.[0]
              ?.reception_tables?.name
            return (
              <tr
                key={guest.id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="border border-gray-200 px-3 py-2 text-xs text-gray-400">
                  {index + 1}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800">
                  {guest.name}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-xs text-gray-500">
                  {guest.category}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-xs">
                  <span className={
                    guest.rsvp_status === 'yes' || guest.rsvp_status === 'yes_joy'
                      ? 'text-green-600 font-medium'
                      : guest.rsvp_status === 'no' || guest.rsvp_status === 'from_afar'
                      ? 'text-red-500'
                      : 'text-amber-600'
                  }>
                    {RSVP_LABELS[guest.rsvp_status] || guest.rsvp_status}
                  </span>
                </td>
                <td className="border border-gray-200 px-3 py-2 text-xs text-gray-500">
                  {tableName || '—'}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-xs text-gray-500">
                  {guest.dietary_restrictions || '—'}
                </td>
                <td className="border border-gray-200 px-3 py-2 text-xs text-gray-400">
                  {guest.email || guest.phone || '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-300">
          Generated by WeddingInvite · {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}