import { MapPin, Calendar } from 'lucide-react'
import AskUsherNote from './AskUsherNote'

interface Props {
  guestName?: string
  tableName?: string
  notSeated?: boolean
  primary: string
  eventDate?: string | null
  venueName?: string | null
}

export default function SeatResultCard({
  guestName, tableName, notSeated, primary, eventDate, venueName,
}: Props) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })

  if (notSeated) {
    return (
      <>
        <h1 className="text-lg font-bold text-gray-800 mt-4 mb-2">
          {guestName ? `Hi ${guestName}!` : 'No table found'}
        </h1>
        <p className="text-gray-500 text-sm">
          We couldn't find an assigned table for you.
          <br />
          Please speak with an usher for assistance.
        </p>
        <AskUsherNote prominent />
      </>
    )
  }

  return (
    <>
      <h1 className="text-xl font-bold text-gray-800 mt-4 mb-5">
        Welcome, {guestName}!
      </h1>
      <div
        className="rounded-3xl py-8 px-4 my-2"
        style={{ backgroundColor: primary }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-white/70 font-bold mb-2">
          Your Table
        </p>
        <p className="text-3xl sm:text-4xl font-extrabold text-white leading-tight break-words">
          {tableName}
        </p>
      </div>
      <p className="text-gray-700 font-medium mt-5">
        Please proceed to {tableName}.
      </p>

      {(eventDate || venueName) && (
        <div className="space-y-1.5 text-xs text-gray-400 mt-6">
          {eventDate && (
            <p className="flex items-center justify-center gap-1.5">
              <Calendar size={12} />
              {formatDate(eventDate)}
            </p>
          )}
          {venueName && (
            <p className="flex items-center justify-center gap-1.5">
              <MapPin size={12} />
              {venueName}
            </p>
          )}
        </div>
      )}

      <AskUsherNote />
    </>
  )
}
