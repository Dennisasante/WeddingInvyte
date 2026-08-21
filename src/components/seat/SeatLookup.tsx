import { Heart } from 'lucide-react'
import BrandFooter from '@/components/BrandFooter'
import SeatResultCard from './SeatResultCard'

interface SeatResult {
  error?: 'not_found' | 'inactive' | 'not_seated'
  guest_name?: string
  table_name?: string
  wedding?: {
    couple_names: string
    primary_color: string
    secondary_color: string
    accent_color: string
    venue_name: string | null
    event_date: string | null
  }
}

export default function SeatLookup({ result }: { result: SeatResult }) {
  const wedding = result.wedding
  const primary = wedding?.primary_color || '#D4A373'
  const secondary = wedding?.secondary_color || '#FEFAE0'

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: secondary }}
    >
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <Heart size={22} style={{ color: primary }} className="mx-auto mb-3" fill={primary} />

        {wedding && (
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
            {wedding.couple_names}
          </p>
        )}

        <SeatResultCard
          guestName={result.guest_name}
          tableName={result.table_name}
          notSeated={result.error === 'not_seated'}
          primary={primary}
          eventDate={wedding?.event_date}
          venueName={wedding?.venue_name}
        />

        <BrandFooter />
      </div>
    </div>
  )
}
