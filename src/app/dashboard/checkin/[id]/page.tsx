import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import CheckInManager from '@/components/checkin/CheckInManager'

export default async function CheckInWeddingPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, couple_names')
    .eq('id', params.id)
    .single()

  if (!wedding) return notFound()

  const { data: guests } = await supabase
    .from('guests')
    .select('*, seating_assignments(reception_tables(name))')
    .eq('wedding_id', params.id)
    .is('deleted_at', null)
    .order('name')

  return (
    <CheckInManager
      guests={guests || []}
      weddingId={params.id}
    />
  )
}