export interface RelGuest {
  id: string
  name: string
  category: string
  partner_id?: string | null
  is_plus_one_of?: string | null
}

export type RelationKind = 'partner' | 'plus_one_of' | 'plus_one'

export interface Relation {
  other: RelGuest
  kind: RelationKind
  // Reads as "<prefix> <other.name>"
  prefix: string
}

const PREFIX: Record<RelationKind, string> = {
  partner: 'Couple with',
  plus_one_of: '+1 of',
  plus_one: '+1:',
}

// Works out who each guest is together with: their partner (couples entered
// as two guests), the guest they are a plus one of, and their own plus one.
export function buildRelations(guests: RelGuest[]) {
  const byId = new Map(guests.map(g => [g.id, g]))

  const plusOnesByHost = new Map<string, RelGuest[]>()
  guests.forEach(g => {
    if (g.category === 'plus_one' && g.is_plus_one_of) {
      plusOnesByHost.set(g.is_plus_one_of, [...(plusOnesByHost.get(g.is_plus_one_of) || []), g])
    }
  })

  const related = (g: RelGuest): Relation[] => {
    const out: Relation[] = []

    const partner = g.partner_id ? byId.get(g.partner_id) : undefined
    if (partner) out.push({ other: partner, kind: 'partner', prefix: PREFIX.partner })

    if (g.category === 'plus_one' && g.is_plus_one_of) {
      const host = byId.get(g.is_plus_one_of)
      if (host) out.push({ other: host, kind: 'plus_one_of', prefix: PREFIX.plus_one_of })
    }

    ;(plusOnesByHost.get(g.id) || []).forEach(p =>
      out.push({ other: p, kind: 'plus_one', prefix: PREFIX.plus_one })
    )

    return out
  }

  // (A couple entered as one "Mr & Mrs ..." row has no relations to show —
  // it's already complete and counts as two people.)
  const label = (g: RelGuest): string | null => {
    const parts = related(g).map(r => `${r.prefix} ${r.other.name}`)
    return parts.length ? parts.join(' · ') : null
  }

  return { byId, related, label }
}
