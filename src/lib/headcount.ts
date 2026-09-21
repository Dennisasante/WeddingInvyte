interface CountableGuest {
  category: string
  partner_id?: string | null
  couple_attendance?: string | null
}

// How many people a guest row represents. A couple whose partner has their
// own row (partner_id set) is one person per row; a legacy 'couple' row with
// no partner row is still one row standing for two people.
export function headcount(guest: CountableGuest): number {
  return guest.category === 'couple' && !guest.partner_id ? 2 : 1
}

export function sumHeadcount(guests: CountableGuest[]): number {
  return guests.reduce((sum, g) => sum + headcount(g), 0)
}

// People actually coming: a legacy couple that replied "Mr only" / "Mrs only"
// is one person, not two.
export function attendingHeadcount(guest: CountableGuest): number {
  if (
    guest.category === 'couple' &&
    !guest.partner_id &&
    (guest.couple_attendance === 'mr' || guest.couple_attendance === 'mrs')
  ) {
    return 1
  }
  return headcount(guest)
}

export function sumAttendingHeadcount(guests: CountableGuest[]): number {
  return guests.reduce((sum, g) => sum + attendingHeadcount(g), 0)
}
