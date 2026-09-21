import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WeddingDayPanel from '@/components/wedding-day/WeddingDayPanel'
import { headcount, sumHeadcount } from '@/lib/headcount'

export default async function WeddingDayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.wedding_id) redirect('/dashboard')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, couple_names')
    .eq('id', profile.wedding_id)
    .single()

  const { data: guests } = await supabase
    .from('guests')
    .select('id, category, partner_id')
    .eq('wedding_id', profile.wedding_id)
    .is('deleted_at', null)

  const { data: assignments } = await supabase
    .from('seating_assignments')
    .select('guest_id')
    .eq('wedding_id', profile.wedding_id)

  // Counts are people, not rows: a couple counts as two.
  const seatedIds = new Set((assignments || []).map(a => a.guest_id))
  const totalGuests = sumHeadcount(guests || [])
  const withTable = (guests || [])
    .filter(g => seatedIds.has(g.id))
    .reduce((sum, g) => sum + headcount(g), 0)

  return (
    <WeddingDayPanel
      weddingId={profile.wedding_id}
      coupleNames={wedding?.couple_names || ''}
      totalGuests={totalGuests}
      withTable={withTable}
    />
  )
}
