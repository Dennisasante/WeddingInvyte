import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RSVPForm from '@/components/rsvp/RSVPForm'

export default async function RSVPPage({
  params,
}: {
  params: { token: string }
}) {
  const supabase = await createClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('*')
    .eq('invite_token', params.token)
    .is('deleted_at', null)
    .single()

  if (!guest) return notFound()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', guest.wedding_id)
    .single()

  if (!wedding || !wedding.is_active) return notFound()

  if (!guest.opened_at) {
    await supabase
      .from('guests')
      .update({
        opened_at: new Date().toISOString(),
        invite_status: 'opened',
      })
      .eq('id', guest.id)
  }

  // Full wedding website mode coming soon
  // if (wedding.website_enabled) {
  //   return <FullWeddingWebsite wedding={wedding} guest={guest} />
  // }

  return <RSVPForm guest={guest} wedding={wedding} />
}