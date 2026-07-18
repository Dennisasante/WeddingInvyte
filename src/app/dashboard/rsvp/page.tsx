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

  const { data: plusOneRequests } = await supabase
    .from('plus_one_requests')
    .select('*, guests(name, email)')
    .eq('wedding_id', profile.wedding_id)
    .order('requested_at', { ascending: false })

  return (
    <RSVPManager
      guests={guests || []}
      plusOneRequests={plusOneRequests || []}
      weddingId={profile.wedding_id}
    />
  )
}