import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import OpenRSVPForm from '@/components/rsvp/OpenRSVPForm'

export default async function OpenRSVPPage({
  params,
}: {
  params: { weddingId: string }
}) {
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', params.weddingId)
    .single()

  if (!wedding || !wedding.is_active) return notFound()

  // Full wedding website mode coming soon
  // if (wedding.website_enabled) {
  //   return <FullWeddingWebsite wedding={wedding} guest={null} />
  // }

  return <OpenRSVPForm wedding={wedding} />
}