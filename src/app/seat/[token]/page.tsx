import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SeatLookup from '@/components/seat/SeatLookup'

interface SeatResult {
  error?: 'not_found' | 'inactive' | 'not_seated'
  guest_name?: string
  table_name?: string
  wedding?: {
    couple_names: string
    theme_preset: string
    primary_color: string
    secondary_color: string
    accent_color: string
    venue_name: string | null
    event_date: string | null
  }
}

export default async function SeatPage({
  params,
}: {
  params: { token: string }
}) {
  const supabase = await createClient()

  const { data } = await supabase.rpc('get_seat_by_token', {
    p_token: params.token,
  })

  const result = data as SeatResult

  if (!result || result.error === 'not_found' || result.error === 'inactive') {
    return notFound()
  }

  return <SeatLookup result={result} />
}
