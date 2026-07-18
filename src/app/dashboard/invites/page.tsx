import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InviteManager from '@/components/invites/InviteManager'

export default async function InvitesPage() {
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
    .select('*')
    .eq('id', profile.wedding_id)
    .single()

  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', profile.wedding_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <InviteManager
      wedding={wedding}
      guests={guests || []}
    />
  )
}