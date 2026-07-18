import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WeddingEditor from '@/components/wedding/WeddingEditor'

export default async function WeddingPage() {
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

  if (!wedding) redirect('/dashboard')

  return <WeddingEditor wedding={wedding} />
}