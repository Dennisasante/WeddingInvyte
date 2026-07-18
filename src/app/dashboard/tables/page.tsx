import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SeatingManager from '@/components/seating/SeatingManager'

export default async function TablesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.wedding_id) redirect('/dashboard')

  const { data: tables } = await supabase
    .from('reception_tables')
    .select('*, seating_assignments(*, guests(id, name, category))')
    .eq('wedding_id', profile.wedding_id)
    .order('name')

  const assignedGuestIds = (tables || [])
    .flatMap(t => t.seating_assignments || [])
    .map((a: { guest_id: string }) => a.guest_id)

  let unassignedQuery = supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', profile.wedding_id)
    .is('deleted_at', null)

  if (assignedGuestIds.length > 0) {
    unassignedQuery = unassignedQuery.not('id', 'in', `(${assignedGuestIds.join(',')})`)
  }

  const { data: unassignedGuests } = await unassignedQuery

  return (
    <SeatingManager
      tables={tables || []}
      unassignedGuests={unassignedGuests || []}
      weddingId={profile.wedding_id}
    />
  )
}