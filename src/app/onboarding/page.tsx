import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signup')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If they already have a wedding, go to dashboard
  if (profile?.wedding_id) redirect('/dashboard')

  // Super admins don't need onboarding
  if (profile?.role === 'super_admin') redirect('/dashboard')

  return <OnboardingWizard userId={user.id} userEmail={user.email || ''} />
}