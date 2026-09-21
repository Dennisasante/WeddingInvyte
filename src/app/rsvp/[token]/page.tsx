import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import RSVPForm from '@/components/rsvp/RSVPForm'

// Only what the form needs goes to the guest's browser — not the couple's
// private notes, the guest's email, etc.
const GUEST_FIELDS = 'id, wedding_id, name, category, allow_plus_one, rsvp_status, invite_token, partner_id, opened_at'

// (one literal string so the query builder can infer the row type)
const WEDDING_FIELDS = 'id, couple_names, couple_photo_url, event_date, venue_name, venue_address, welcome_message, dress_code, rsvp_deadline, primary_color, secondary_color, cover_photo_url, existing_website_url, directions, maps_url, show_cover_overlay, cover_overlay_text, flyer_image_url, is_active'

export default async function RSVPPage({
  params,
}: {
  params: { token: string }
}) {
  // Logged-out visitors hold only an invite token, so this page looks
  // everything up by that token with the server-side client.
  const supabase = createAdminClient()

  const { data: guest } = await supabase
    .from('guests')
    .select(GUEST_FIELDS)
    .eq('invite_token', params.token)
    .is('deleted_at', null)
    .single()

  if (!guest) return notFound()

  const { data: wedding } = await supabase
    .from('weddings')
    .select(WEDDING_FIELDS)
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
