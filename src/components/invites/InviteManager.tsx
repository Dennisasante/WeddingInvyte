'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Link2, Mail, QrCode, Send, CheckCircle,
  Clock, Eye, X, MessageCircle
} from 'lucide-react'
import QRCode from 'react-qr-code'

interface Guest {
  id: string
  name: string
  email: string | null
  phone: string | null
  invite_token: string
  invite_status: string
  rsvp_status: string
}

interface Wedding {
  id: string
  couple_names: string
  primary_color: string
  event_date: string | null
  venue_name: string | null
}

interface Props {
  wedding: Wedding | null
  guests: Guest[]
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-gray-100 text-gray-500',
  sent:      'bg-amber-50 text-amber-700',
  opened:    'bg-blue-50 text-blue-700',
  responded: 'bg-green-50 text-green-700',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending:   <Clock size={10} />,
  sent:      <Send size={10} />,
  opened:    <Eye size={10} />,
  responded: <CheckCircle size={10} />,
}

export default function InviteManager({ wedding, guests }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const [qrGuest, setQrGuest] = useState<Guest | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const getRsvpLink = (token: string) => `${appUrl}/rsvp/${token}`

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    const withEmail = guests.filter(g => g.email).map(g => g.id)
    setSelected(selected.length === withEmail.length ? [] : withEmail)
  }

  const copyLink = async (guest: Guest) => {
    await navigator.clipboard.writeText(getRsvpLink(guest.invite_token))
    setCopiedId(guest.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const shareWhatsApp = (guest: Guest) => {
  const link = getRsvpLink(guest.invite_token)
  const weddingDate = wedding?.event_date
    ? new Date(wedding.event_date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long',
        day: 'numeric', year: 'numeric'
      })
    : ''

  // Build the message first without encoding
  const lines = [
    `Dear ${guest.name}, 💍`,
    ``,
    `You are cordially invited to celebrate the wedding of`,
    `*${wedding?.couple_names}*`,
    weddingDate ? `📅 ${weddingDate}` : '',
    wedding?.venue_name ? `📍 ${wedding.venue_name}` : '',
    ``,
    `Please RSVP by tapping the link below:`,
    link,
    ``,
    `We look forward to celebrating with you! 🎊`,
  ].filter(line => line !== null && line !== undefined)

  const message = lines.join('\n')

  // Use encodeURIComponent but it handles emojis fine in modern browsers
  // The issue is WhatsApp desktop vs mobile rendering
  const encoded = encodeURIComponent(message)

  if (guest.phone) {
    let cleaned = guest.phone.replace(/\D/g, '')
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '233' + cleaned.substring(1)
    }
    if (cleaned.length === 9) {
      cleaned = '233' + cleaned
    }
    window.open(`https://wa.me/${cleaned}?text=${encoded}`, '_blank')
  } else {
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  supabase
    .from('guests')
    .update({ invite_status: 'sent' })
    .eq('id', guest.id)
    .then(() => null)
}

  const sendEmailInvites = async () => {
    if (!selected.length || !wedding) return
    setSending(true)
    setMessage('')

    try {
      const response = await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestIds: selected,
          weddingId: wedding.id
        })
      })

      const data = await response.json()
      const sentCount = data.results?.filter(
        (r: { sent: boolean }) => r.sent
      ).length || 0

      setMessage(`✅ ${sentCount} email invite${sentCount !== 1 ? 's' : ''} sent!`)
      setSelected([])
      setTimeout(() => window.location.reload(), 1500)
    } catch {
      setMessage('❌ Failed to send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const stats = {
    total:     guests.length,
    sent:      guests.filter(g => g.invite_status === 'sent').length,
    opened:    guests.filter(g => g.invite_status === 'opened').length,
    responded: guests.filter(g => g.invite_status === 'responded').length,
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invitations</h1>
          <p className="text-gray-500 text-sm mt-1">
            Send and track guest invites
          </p>
        </div>
        {selected.length > 0 && (
          <button
            onClick={sendEmailInvites}
            disabled={sending}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-60"
          >
            <Mail size={15} />
            {sending
              ? 'Sending...'
              : `Email ${selected.length} guest${selected.length !== 1 ? 's' : ''}`}
          </button>
        )}
      </div>

      {/* How to send banner */}
      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <MessageCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-green-800">
            WhatsApp Invites (Recommended)
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            Click the <strong>WhatsApp icon</strong> next to any guest to send
            their personal invite via WhatsApp. If their number is saved,
            it opens a direct chat. Otherwise it opens WhatsApp with the
            message ready to share.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Sent', value: stats.sent },
          { label: 'Opened', value: stats.opened },
          { label: 'Responded', value: stats.responded },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center"
          >
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">
          {message}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Select all bar */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
          <input
            type="checkbox"
            onChange={selectAll}
            checked={
              guests.filter(g => g.email).length > 0 &&
              selected.length === guests.filter(g => g.email).length
            }
            className="w-4 h-4 rounded accent-amber-500"
          />
          <span className="text-sm text-gray-500">
            {selected.length > 0
              ? `${selected.length} selected for email`
              : `Select guests to send email invites`}
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-100">
              {['', 'Guest', 'Contact', 'Status', 'RSVP', 'Actions'].map(h => (
                <th
                  key={h}
                  className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {guests.map(guest => (
              <tr key={guest.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-4">
                  {guest.email && (
                    <input
                      type="checkbox"
                      checked={selected.includes(guest.id)}
                      onChange={() => toggleSelect(guest.id)}
                      className="w-4 h-4 rounded accent-amber-500"
                    />
                  )}
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-800">{guest.name}</p>
                </td>
                <td className="px-5 py-4">
                  {guest.phone && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <MessageCircle size={11} />
                      {guest.phone}
                    </p>
                  )}
                  {guest.email && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Mail size={11} />
                      {guest.email}
                    </p>
                  )}
                  {!guest.phone && !guest.email && (
                    <p className="text-xs text-gray-300">No contact info</p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[guest.invite_status] || STATUS_STYLES.pending}`}>
                    {STATUS_ICONS[guest.invite_status]}
                    {guest.invite_status || 'pending'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium ${
                    guest.rsvp_status === 'yes' || guest.rsvp_status === 'yes_joy'
                      ? 'text-green-600'
                      : guest.rsvp_status === 'no' || guest.rsvp_status === 'from_afar'
                      ? 'text-red-500'
                      : 'text-gray-400'
                  }`}>
                    {guest.rsvp_status === 'pending' ? '—' : guest.rsvp_status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {/* WhatsApp */}
                    <button
                      onClick={() => shareWhatsApp(guest)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                      title={guest.phone
                        ? `Send WhatsApp to ${guest.phone}`
                        : 'Share via WhatsApp'}
                    >
                      <MessageCircle size={15} />
                    </button>

                    {/* Copy link */}
                    <button
                      onClick={() => copyLink(guest)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition"
                      title="Copy RSVP link"
                    >
                      {copiedId === guest.id
                        ? <CheckCircle size={15} className="text-green-500" />
                        : <Link2 size={15} />
                      }
                    </button>

                    {/* QR Code */}
                    <button
                      onClick={() => setQrGuest(guest)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition"
                      title="Show QR code"
                    >
                      <QrCode size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {guests.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Mail size={32} className="mx-auto mb-3 opacity-30" />
            <p>No guests yet. Add guests first to send invites.</p>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {qrGuest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 text-center max-w-xs w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">{qrGuest.name}</h3>
              <button
                onClick={() => setQrGuest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-6">Scan to RSVP</p>
            <div className="flex justify-center mb-6 p-4 bg-white rounded-xl border border-gray-100">
              <QRCode
                value={getRsvpLink(qrGuest.invite_token)}
                size={180}
              />
            </div>
            <p className="text-xs text-gray-400 break-all mb-4">
              {getRsvpLink(qrGuest.invite_token)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => copyLink(qrGuest)}
                className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-sm font-medium transition"
              >
                {copiedId === qrGuest.id ? '✓ Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={() => shareWhatsApp(qrGuest)}
                className="flex-1 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
              >
                <MessageCircle size={14} />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}