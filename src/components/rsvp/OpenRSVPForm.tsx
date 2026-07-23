'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, MapPin, Calendar } from 'lucide-react'

interface Wedding {
  id: string
  couple_names: string
  event_date: string | null
  venue_name: string | null
  welcome_message: string | null
  dress_code: string | null
  rsvp_deadline: string | null
  primary_color: string
  secondary_color: string
  couple_photo_url: string | null
  cover_photo_url: string | null
  show_cover_overlay: boolean
  cover_overlay_text: string | null
  flyer_image_url: string | null
}

const RSVP_OPTIONS = [
  { key: 'yes', label: "Yes, I'll be attending.", emoji: '✨' },
  { key: 'no', label: "Regretfully, I can't make it.", emoji: '😔' },
]

export default function OpenRSVPForm({ wedding }: { wedding: Wedding }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [response, setResponse] = useState('')
  const [dietary, setDietary] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const supabase = createClient()

  const primary = wedding.primary_color || '#D4A373'
  const secondary = wedding.secondary_color || '#FEFAE0'
  const isAttending = response === 'yes' || response === 'yes_joy'

  const isDeadlinePassed = wedding.rsvp_deadline
    ? new Date() > new Date(wedding.rsvp_deadline)
    : false

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric',
      month: 'long', day: 'numeric'
    })

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    if (!phone.trim()) {
      setError('Please enter your phone number')
      return
    }
    if (!response) {
      setError('Please select a response')
      return
    }

    setLoading(true)
    setError('')

    // Create a guest record for this open invite
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .insert({
        wedding_id: wedding.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        category: 'individual',
        rsvp_status: response,
        dietary_restrictions: dietary || null,
        guest_message: message || null,
        invite_status: 'responded',
        responded_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (guestError) {
      setError(guestError.message)
      setLoading(false)
      return
    }

    // Send confirmation email if they provided one
    if (guest?.email) {
      await fetch('/api/rsvp/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: name,
          response,
          weddingId: wedding.id,
          token: guest.invite_token,
        }),
      }).catch(() => null)
    }

    setConfirmed(true)
    setLoading(false)

    // Notify the couple
    fetch('/api/notify-couple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weddingId: wedding.id,
        guestName: name,
        response,
        dietary: dietary || null,
        message: message || null,
      }),
    }).catch(() => null)
  }

  if (confirmed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: `linear-gradient(135deg, ${secondary}cc, white)` }}
      >
        <div className="text-center max-w-md">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${primary}20` }}
          >
            <Heart size={36} style={{ color: primary }} fill={primary} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Thank you, {name.split(' ')[0]}!
          </h2>
          <p className="text-gray-500 mb-2">Your RSVP has been received.</p>
          <p className="text-gray-400 text-sm">
            {wedding.couple_names} can't wait to celebrate!
          </p>
          {wedding.flyer_image_url && (
            <div className="mt-6">
              <img
                src={wedding.flyer_image_url}
                alt="Wedding attachment"
                className="w-full rounded-xl shadow-md"
              />

              <a
                href={wedding.flyer_image_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-6 py-2.5 rounded-xl border text-sm font-medium"
                style={{
                  borderColor: `${primary}40`,
                  color: primary,
                }}
              >
                Download Image
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ background: `linear-gradient(135deg, ${secondary}cc, white)` }}
    >
      <div className="max-w-lg mx-auto">
        {/* Header */}
        {/* Physical Invitation Card Header */}
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl mb-6"
          style={{ border: `2px solid ${primary}40` }}
        >
          {wedding.cover_photo_url ? (
            <div className="relative h-72">
              <img
                src={wedding.cover_photo_url}
                alt="Wedding"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom, transparent 20%, ${primary}ee 100%)`
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                {wedding.show_cover_overlay !== false && (
                  <>
                    <p className="text-white/70 text-xs uppercase tracking-widest mb-1">
                      {wedding.cover_overlay_text || 'Together with their families'}
                    </p>
                    <h1 className="text-white font-bold text-2xl">
                      {wedding.couple_names}
                    </h1>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div
              className="h-48 flex items-center justify-center"
              style={{ backgroundColor: primary }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">💍</div>
                <h1 className="text-white font-bold text-2xl">
                  {wedding.couple_names}
                </h1>
              </div>
            </div>
          )}

          <div className="p-6 text-center" style={{ backgroundColor: secondary }}>
            {/* Couple Photo Circle Overlay */}
            {wedding.couple_photo_url && (
              <div className="flex justify-center -mt-16 mb-4">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden">
                  <img
                    src={wedding.couple_photo_url}
                    alt="The couple"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px" style={{ backgroundColor: `${primary}40` }} />
              <span style={{ color: primary }}>✦</span>
              <div className="flex-1 h-px" style={{ backgroundColor: `${primary}40` }} />
            </div>
            {wedding.event_date && (
              <p className="text-gray-700 font-medium">
                {new Date(wedding.event_date).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long',
                  day: 'numeric', year: 'numeric'
                })}
              </p>
            )}
            {wedding.venue_name && (
              <p className="text-gray-500 text-sm mt-1">📍 {wedding.venue_name}</p>
            )}
            {wedding.welcome_message && (
              <p className="text-sm italic mt-3" style={{ color: `${primary}cc` }}>
                "{wedding.welcome_message}"
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <div
          className="bg-white rounded-2xl shadow-lg p-6 border"
          style={{ borderColor: `${primary}20` }}
        >
          {isDeadlinePassed && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-center">
              <p className="text-red-600 font-medium text-sm">
                ⏰ The RSVP deadline has passed
              </p>
              <p className="text-red-400 text-xs mt-1">
                Please contact the couple directly.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6"></div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="+233 24 000 0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
                <span className="text-gray-400 font-normal ml-1">(optional — for confirmation)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="jane@example.com"
              />
            </div>
          </div>

          {wedding.rsvp_deadline && !isDeadlinePassed && (
            <div
              className="mb-5 p-4 rounded-2xl text-center border-2"
              style={{ borderColor: primary, backgroundColor: `${primary}15` }}
            >
              <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: primary }}>
                ⏰ RSVP Deadline
              </p>
              <p className="text-lg font-extrabold text-gray-800">
                {new Date(wedding.rsvp_deadline).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                })}
              </p>
            </div>
          )}

          <p className="text-sm font-medium text-gray-700 mb-3">
            Will you be attending?
          </p>
          <div className="space-y-3 mb-6">
            {RSVP_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setResponse(opt.key)}
                disabled={isDeadlinePassed}
                className="w-full text-left px-4 py-3.5 rounded-xl border-2 transition flex items-center gap-3 disabled:opacity-50"
                style={response === opt.key
                  ? { borderColor: primary, backgroundColor: primary, color: 'white' }
                  : { borderColor: '#f3f4f6', backgroundColor: '#f9fafb', color: '#374151' }
                }
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>

          {isAttending && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary restrictions
              </label>
              <input
                value={dietary}
                onChange={e => setDietary(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
                placeholder="Vegetarian, vegan, allergies..."
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message for the couple
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none"
              placeholder="Share your wishes..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!response || !name.trim() || !phone.trim() || loading || isDeadlinePassed}
            className="w-full py-4 rounded-xl text-white font-bold transition disabled:opacity-50"
            style={{ backgroundColor: primary }}
          >
            {loading ? 'Sending RSVP...' : 'Send RSVP 💌'}
          </button>

          {wedding.dress_code && (
            <p className="text-xs text-gray-400 text-center mt-4">
              👗 Dress code: {wedding.dress_code}
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-300 mt-8">
          Made with ❤️ by WeddingInvite
        </p>
      </div>
    </div>
  )
}