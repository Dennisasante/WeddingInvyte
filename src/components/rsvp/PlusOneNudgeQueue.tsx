'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { guestsMissingPlusOne } from '@/lib/plusOne'
import { whatsappUrl, whatsappDigits } from '@/lib/whatsapp'

interface Guest {
  id: string
  name: string
  phone: string | null
  invite_token: string
  rsvp_status: string
  category: string
  allow_plus_one: boolean
  is_plus_one_of?: string | null
  plus_one_nudged_at?: string | null
}

interface Props {
  guests: Guest[]
  coupleNames: string
}

// A one-tap queue for guests who are coming and allowed a plus one but
// haven't named one: opens WhatsApp with their own RSVP link (which now lets
// them add the plus one), then remembers who has been messaged.
export default function PlusOneNudgeQueue({ guests, coupleNames }: Props) {
  const [nudged, setNudged] = useState<Record<string, string>>(
    Object.fromEntries(
      guests.filter(g => g.plus_one_nudged_at).map(g => [g.id, g.plus_one_nudged_at as string])
    )
  )
  const [error, setError] = useState('')
  const supabase = createClient()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const missing = guestsMissingPlusOne(guests)
  const toSend = missing.filter(g => !nudged[g.id])
  const sent = missing.filter(g => nudged[g.id])
  const next = toSend[0]

  const buildMessage = (g: Guest) =>
    [
      `Hi ${g.name.split(' ')[0]}! 💍`,
      ``,
      `Thank you for confirming you'll be at ${coupleNames}'s wedding.`,
      `You're welcome to bring a plus one — please add their name and phone number here so they're on the guest list:`,
      `${appUrl}/rsvp/${g.invite_token}`,
    ].join('\n')

  const send = (g: Guest) => {
    // Open WhatsApp straight away (must happen inside the click), then note it.
    window.open(whatsappUrl(g.phone, buildMessage(g)), '_blank')

    const now = new Date().toISOString()
    setNudged(prev => ({ ...prev, [g.id]: now }))
    setError('')

    supabase
      .from('guests')
      .update({ plus_one_nudged_at: now })
      .eq('id', g.id)
      .then(({ error: updateError }) => {
        if (updateError) {
          setError("Sent, but couldn't remember it — the database update for this hasn't been run yet.")
        }
      })
  }

  if (missing.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
        <CheckCircle2 size={32} className="mx-auto mb-3 text-green-400 opacity-70" />
        <p className="font-medium text-gray-600">Everyone allowed a plus one has named theirs</p>
        <p className="text-sm mt-1">Nothing to send right now.</p>
      </div>
    )
  }

  const row = (g: Guest, isSent: boolean) => (
    <div
      key={g.id}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3"
    >
      <div className="min-w-0">
        <p className="font-medium text-gray-800 truncate">{g.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {whatsappDigits(g.phone)
            ? g.phone
            : <span className="text-amber-600 flex items-center gap-1"><AlertCircle size={11} />No WhatsApp number — you'll choose who to send to</span>}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {isSent && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 size={13} />
            Sent {new Date(nudged[g.id]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
        <button
          onClick={() => send(g)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
            isSent
              ? 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          <MessageCircle size={13} />
          {isSent ? 'Send again' : 'WhatsApp'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-bold text-green-800">
            {toSend.length > 0
              ? `${toSend.length} guest${toSend.length !== 1 ? 's' : ''} still to message`
              : 'Everyone has been messaged'}
          </p>
          <p className="text-xs text-green-700 mt-0.5">
            These guests are coming and can bring a plus one, but haven't added them yet.
            Each message includes their own link to add the name and number.
          </p>
        </div>
        {next && (
          <button
            onClick={() => send(next)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <MessageCircle size={15} />
            Send to {next.name.split(' ')[0]}
            {toSend.length > 1 && <span className="opacity-75">· {toSend.length - 1} more</span>}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-sm border border-amber-100">
          {error}
        </div>
      )}

      {toSend.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To send</p>
          {toSend.map(g => row(g, false))}
        </div>
      )}

      {sent.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Already messaged</p>
          {sent.map(g => row(g, true))}
        </div>
      )}
    </div>
  )
}
