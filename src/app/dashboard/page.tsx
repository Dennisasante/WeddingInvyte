import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard'
import CoupleAdminDashboard from '@/components/dashboard/CoupleAdminDashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  if (profile.role === 'super_admin') {
    const { data: weddings } = await supabase
      .from('weddings')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: allGuests } = await supabase
      .from('guests')
      .select('id, wedding_id, rsvp_status')
      .is('deleted_at', null)

    return (
      <SuperAdminDashboard
        profile={profile}
        weddings={weddings || []}
        guests={allGuests || []}
      />
    )
  }

  // Couple Admin
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

  return (
    <CoupleAdminDashboard
      profile={profile}
      wedding={wedding || null}
      guests={guests || []}
    />
  )
}