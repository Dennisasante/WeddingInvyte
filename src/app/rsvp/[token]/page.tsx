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

  // The partner (for couples entered as two guests) and any plus one this
  // guest already named, so the form can show and pre-fill them.
  let partner: { id: string; name: string } | null = null
  if (guest.partner_id) {
    const { data } = await supabase
      .from('guests')
      .select('id, name')
      .eq('id', guest.partner_id)
      .is('deleted_at', null)
      .maybeSingle()
    partner = data
  }

  const { data: plusOne } = await supabase
    .from('guests')
    .select('name, phone')
    .eq('is_plus_one_of', guest.id)
    .is('deleted_at', null)
    .limit(1)
    .maybeSingle()

  return <RSVPForm guest={guest} wedding={wedding} partner={partner} plusOne={plusOne} />
}
