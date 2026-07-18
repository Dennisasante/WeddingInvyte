import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PrintGuestList from '@/components/guests/PrintGuestList'

export default async function PrintGuestsPage() {
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

  const { data: guests } = await supabase
    .from('guests')
    .select('*, seating_assignments(reception_tables(name))')
    .eq('wedding_id', profile.wedding_id)
    .is('deleted_at', null)
    .order('name')

  return <PrintGuestList wedding={wedding} guests={guests || []} />
}