import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UsherMode from '@/components/usher/UsherMode'

export default async function UsherPage() {
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
    .select('*, seating_assignments(reception_tables(name))')
    .eq('wedding_id', profile.wedding_id)
    .is('deleted_at', null)
    .order('name')

  return <UsherMode guests={guests || []} />
}
