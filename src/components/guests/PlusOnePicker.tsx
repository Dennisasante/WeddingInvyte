'use client'
import GuestPicker, { PickableGuest } from './GuestPicker'

export type { PickableGuest }

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
  const hostsWithPlusOne = new Set(
    guests
      .filter(g => g.category === 'plus_one' && g.is_plus_one_of && g.id !== excludeId)
      .map(g => g.is_plus_one_of as string)
  )

  const candidates = guests.filter(g =>
    g.category !== 'plus_one' && g.id !== excludeId && !hostsWithPlusOne.has(g.id)
  )

  return (
    <GuestPicker
      candidates={candidates}
      allGuests={guests}
      value={value}
      onChange={onChange}
      placeholder="Search for the guest they're coming with..."
      selectedPrefix="+1 of"
      emptyHint="No match (guests who already have a plus one aren't listed)"
    />
  )
}
