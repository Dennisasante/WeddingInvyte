import { MapPin, Calendar, Armchair } from 'lucide-react'

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
          {guestName ? `Hi ${guestName}!` : 'Not seated yet'}
        </h1>
        <p className="text-gray-500 text-sm">
          Your table hasn't been assigned yet — check back closer to the day,
          or ask the couple.
        </p>
      </>
    )
  }

  return (
    <>
      <p className="text-gray-500 text-sm mt-4">
        {guestName}, you're seated at
      </p>
      <div
        className="flex items-center justify-center gap-2 rounded-2xl py-6 my-4"
        style={{ backgroundColor: `${primary}15` }}
      >
        <Armchair size={22} style={{ color: primary }} />
        <span className="text-2xl font-bold text-gray-800">
          {tableName}
        </span>
      </div>

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
    </>
  )
}
