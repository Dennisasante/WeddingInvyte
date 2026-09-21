import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RSVPManager from '@/components/rsvp/RSVPManager'

export default async function RSVPPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.wedding_id) redirect('/dashboard')

  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', profile.wedding_id)
    .is('deleted_at', null)
    .order('responded_at', { ascending: false })

  const { data: wedding } = await supabase
    .from('weddings')
    .select('couple_names')
    .eq('id', profile.wedding_id)
    .single()

  return (
    <RSVPManager
      guests={guests || []}
      weddingId={profile.wedding_id}
      coupleNames={wedding?.couple_names || 'our'}
    />
  )
}