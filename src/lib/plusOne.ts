interface PlusOneGuest {
  id: string
  category: string
  rsvp_status: string
  allow_plus_one: boolean
  is_plus_one_of?: string | null
}

// Guests who are coming, are allowed a plus one, but haven't named one yet.
// (A plus one can't bring their own.)
export function guestsMissingPlusOne<T extends PlusOneGuest>(guests: T[]): T[] {
  const hasPlusOne = new Set(
    guests
      .filter(g => g.category === 'plus_one' && g.is_plus_one_of)
      .map(g => g.is_plus_one_of as string)
  )

  return guests.filter(g =>
    g.category !== 'plus_one' &&
    g.allow_plus_one &&
    (g.rsvp_status === 'yes' || g.rsvp_status === 'yes_joy') &&
    !hasPlusOne.has(g.id)
  )
}
