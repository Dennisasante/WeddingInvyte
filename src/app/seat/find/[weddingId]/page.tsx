import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SeatFinder from '@/components/seat/SeatFinder'

export default async function SeatFindPage({
  params,
}: {
  params: { weddingId: string }
}) {
  const supabase = await createClient()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, couple_names, primary_color, secondary_color, accent_color, venue_name, event_date, is_active')
    .eq('id', params.weddingId)
    .single()

  if (!wedding || !wedding.is_active) return notFound()

  return <SeatFinder wedding={wedding} />
}
