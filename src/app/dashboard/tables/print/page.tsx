import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PrintSeating from '@/components/seating/PrintSeating'

export default async function PrintSeatingPage() {
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
    .select('couple_names, event_date, venue_name')
    .eq('id', profile.wedding_id)
    .single()

  const { data: tables } = await supabase
    .from('reception_tables')
    .select('*, seating_assignments(*, guests(id, name, category, rsvp_status))')
    .eq('wedding_id', profile.wedding_id)
    .order('name')

  return (
    <PrintSeating
      wedding={wedding}
      tables={tables || []}
    />
  )
}