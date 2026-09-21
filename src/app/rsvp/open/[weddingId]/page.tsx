import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import OpenRSVPForm from '@/components/rsvp/OpenRSVPForm'

export default async function OpenRSVPPage({
  params,
}: {
  params: { weddingId: string }
}) {
  const supabase = createAdminClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, couple_names, event_date, venue_name, welcome_message, dress_code, rsvp_deadline, primary_color, secondary_color, couple_photo_url, cover_photo_url, show_cover_overlay, cover_overlay_text, flyer_image_url, is_active')
    .eq('id', params.weddingId)
    .single()

  if (!wedding || !wedding.is_active) return notFound()

  return <OpenRSVPForm wedding={wedding} />
}
