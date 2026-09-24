'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logActivity } from '@/lib/logActivity'

const OPTIONS = [
  { value: 'pending', label: 'No response yet' },
  { value: 'yes', label: 'Attending' },
  { value: 'yes_joy', label: 'Attending, with joy' },
  { value: 'no', label: 'Not attending' },
  { value: 'from_afar', label: 'Celebrating from afar' },
] as const

export const RSVP_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  yes: 'bg-green-50 text-green-700',
  yes_joy: 'bg-emerald-50 text-emerald-700',
  no: 'bg-red-50 text-red-600',
  from_afar: 'bg-purple-50 text-purple-700',
}

interface Guest {
  id: string
  name: string
  rsvp_status: string
}

interface Props {
  guest: Guest
  weddingId: string
  // Called after a successful save. removedGuestIds covers a linked plus one
  // that got removed because this guest is no longer attending.
  onChanged: (guestId: string, patch: { rsvp_status: string }, removedGuestIds: string[]) => void
  className?: string
}

// Lets the couple set a guest's RSVP themselves — for guests who told them
// in person rather than using the RSVP link. Mirrors what happens when a
// guest declines on their own: any plus one they'd named is removed.
export default function RsvpStatusControl({ guest, weddingId, onChanged, className = '' }: Props) {
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleChange = async (value: string) => {
    if (value === guest.rsvp_status || saving) return
    setSaving(true)

    const wasAttending = guest.rsvp_status === 'yes' || guest.rsvp_status === 'yes_joy'
    const nowAttending = value === 'yes' || value === 'yes_joy'

    const { error } = await supabase
      .from('guests')
      .update({
        rsvp_status: value,
        invite_status: value === 'pending' ? 'pending' : 'responded',
        responded_at: value === 'pending' ? null : new Date().toISOString(),
      })
      .eq('id', guest.id)

    if (error) {
      setSaving(false)
      return
    }

    let removedGuestIds: string[] = []
    if (wasAttending && !nowAttending) {
      const { data: plusOnes } = await supabase
        .from('guests')
        .select('id')
        .eq('is_plus_one_of', guest.id)
        .is('deleted_at', null)

      const ids = (plusOnes || []).map(p => p.id)
      if (ids.length) {
        await supabase.from('seating_assignments').delete().in('guest_id', ids)
        await supabase.from('guests').update({ deleted_at: new Date().toISOString() }).in('id', ids)
        removedGuestIds = ids
      }
    }

    onChanged(guest.id, { rsvp_status: value }, removedGuestIds)

    logActivity({
      weddingId,
      action: 'rsvp_received',
      entityType: 'guest',
      entityId: guest.id,
      details: { guestName: guest.name, response: value, source: 'couple_entered' },
    })

    setSaving(false)
  }

  return (
    <select
      value={guest.rsvp_status}
      onChange={e => handleChange(e.target.value)}
      disabled={saving}
      onClick={e => e.stopPropagation()}
      title="Set this guest's RSVP yourself — for guests who told you in person"
      className={`text-xs font-medium rounded-full border-0 pl-2.5 pr-6 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:opacity-50 ${
        RSVP_STATUS_COLORS[guest.rsvp_status] || 'bg-gray-100 text-gray-600'
      } ${className}`}
    >
      {OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
