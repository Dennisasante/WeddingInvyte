import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PlusOneForm from '@/components/rsvp/PlusOneForm'

export default async function PlusOneRSVPPage({
  params,
}: {
  params: { token: string }
}) {
  const supabase = await createClient()

  const { data: plusOneRequest } = await supabase
    .from('plus_one_requests')
    .select('*, guests(*), weddings(*)')
    .eq('token', params.token)
    .single()

  if (!plusOneRequest) return notFound()
  if (plusOneRequest.status !== 'approved') return notFound()

  return (
    <PlusOneForm
      request={plusOneRequest}
      guest={plusOneRequest.guests}
      wedding={plusOneRequest.weddings}
    />
  )
}