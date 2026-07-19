'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart, MapPin, Calendar } from 'lucide-react'

interface Guest {
  id: string
  name: string
  category: string
  allow_plus_one: boolean
  rsvp_status: string
  invite_token: string
}

interface Wedding {
  id: string
  couple_names: string
  couple_photo_url: string | null
  event_date: string | null
  venue_name: string | null
  venue_address: string | null
  welcome_message: string | null
  dress_code: string | null
  rsvp_deadline: string | null
  primary_color: string
  secondary_color: string
  cover_photo_url: string | null
  existing_website_url: string | null
  directions: string | null
  maps_url: string | null
}

interface Props {
  guest: Guest
  wedding: Wedding
}

const RSVP_OPTIONS = [
  { key: 'yes', label: "Yes, I'll be attending.", emoji: '✨' },
  { key: 'yes_joy', label: "I'll be there with joy.", emoji: '💕' },
  { key: 'no', label: "Regretfully, I can't make it.", emoji: '😔' },
  { key: 'from_afar', label: "With love, I'll celebrate from afar.", emoji: '🌟' },
]

type Step = 'welcome' | 'form' | 'confirmed'

export default function RSVPForm({ guest, wedding }: Props) {
  const [step, setStep] = useState<Step>(
    guest.rsvp_status !== 'pending' ? 'confirmed' : 'welcome'
  )
  const [response, setResponse] = useState(
    guest.rsvp_status !== 'pending' ? guest.rsvp_status : ''
  )
  const [coupleAttendance, setCoupleAttendance] = useState('')
  const [dietary, setDietary] = useState('')
  const [message, setMessage] = useState('')
  const [wantsPlusOne, setWantsPlusOne] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const primary = wedding.primary_color || '#D4A373'
  const secondary = wedding.secondary_color || '#FEFAE0'
  const isAttending = response === 'yes' || response === 'yes_joy'

  const isDeadlinePassed = wedding.rsvp_deadline
    ? new Date() > new Date(wedding.rsvp_deadline)
    : false

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })

  const handleSubmit = async () => {
    if (!response) { setError('Please select a response.'); return }
    setLoading(true)
    setError('')

    const { error: rsvpError } = await supabase
      .from('guests')
      .update({
        rsvp_status: response,
        dietary_restrictions: dietary || null,
        guest_message: message || null,
        couple_attendance: coupleAttendance || null,
        invite_status: 'responded',
        responded_at: new Date().toISOString(),
      })
      .eq('invite_token', guest.invite_token)

    if (rsvpError) { setError(rsvpError.message); setLoading(false); return }

    if (isAttending && guest.allow_plus_one && wantsPlusOne) {
      await supabase.from('plus_one_requests').upsert(
        { guest_id: guest.id, wedding_id: wedding.id, status: 'pending' },
        { onConflict: 'guest_id' }
      )
    }

    await fetch('/api/rsvp/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestName: guest.name,
        response,
        weddingId: wedding.id,
        token: guest.invite_token,
      }),
    }).catch(() => null)

    setStep('confirmed')
    setLoading(false)
  }

  if (step === 'confirmed') {
    const isGoing = response === 'yes' || response === 'yes_joy'
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
            {isGoing ? 'See you there!' : 'Thank you!'}
          </h2>
          <p className="text-gray-500 mb-2">
            Your RSVP has been received, {guest.name.split(' ')[0]}.
          </p>
          <p className="text-gray-400 text-sm">
            {wedding.couple_names}{' '}
            {isGoing
              ? "can't wait to celebrate with you!"
              : 'appreciate you letting them know.'}
          </p>
          {isGoing && wedding.event_date && (
            <div className="mt-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-sm text-gray-600">
              <p className="font-medium text-gray-800 mb-1">Save the date</p>
              <p>{formatDate(wedding.event_date)}</p>
              {wedding.venue_name && (
                <p className="mt-1 text-gray-400">📍 {wedding.venue_name}</p>
              )}
            </div>
          )}
          {isGoing && wedding.maps_url && (
            <a
              href={wedding.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-2.5 rounded-xl border text-sm font-medium"
              style={{ borderColor: `${primary}40`, color: primary }}
            >
              📍 Get Directions
            </a>
          )}
        </div>
      </div>
    )
  }

  if (step === 'welcome') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: `linear-gradient(135deg, ${secondary}cc, white)` }}
      >
        <div className="w-full max-w-sm">
          <div
            className="relative rounded-3xl overflow-hidden shadow-2xl"
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
                    background: `linear-gradient(to bottom, transparent 30%, ${primary}ee 100%)`
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                  <p className="text-white/80 text-xs uppercase tracking-widest mb-2 font-light">
                    Together with their families
                  </p>
                  <h1 className="text-white font-bold text-3xl">
                    {wedding.couple_names.split('&')[0]?.trim()}
                  </h1>
                  <p className="text-white/70 text-xl my-1">and</p>
                  <h1 className="text-white font-bold text-3xl">
                    {wedding.couple_names.split('&')[1]?.trim()}
                  </h1>
                </div>
              </div>
            ) : (
              <div
                className="h-72 flex flex-col items-center justify-center p-6 text-center"
                style={{ backgroundColor: primary }}
              >
                <p className="text-white/70 text-xs uppercase tracking-widest mb-4">
                  Together with their families
                </p>
                <div className="text-4xl mb-3">💍</div>
                <h1 className="text-white font-bold text-3xl">
                  {wedding.couple_names.split('&')[0]?.trim()}
                </h1>
                <p className="text-white/60 text-xl my-2">and</p>
                <h1 className="text-white font-bold text-3xl">
                  {wedding.couple_names.split('&')[1]?.trim()}
                </h1>
              </div>
            )}

            <div className="p-6 text-center" style={{ backgroundColor: secondary }}>

              {/* Couple Photo */}
              {wedding.couple_photo_url && (
                <div className="flex justify-center mb-4 -mt-12">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
                    <img
                      src={wedding.couple_photo_url}
                      alt="The couple"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ backgroundColor: `${primary}40` }} />
                <span style={{ color: primary }}>✦</span>
                <div className="flex-1 h-px" style={{ backgroundColor: `${primary}40` }} />
              </div>

              {wedding.event_date && (
                <div className="mb-3">
                  <p
                    className="text-gray-800 font-semibold text-lg flex items-center justify-center gap-2"
                  >
                    <Calendar size={14} style={{ color: primary }} />
                    {new Date(wedding.event_date).toLocaleDateString('en-US', {
                      weekday: 'long'
                    })}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {new Date(wedding.event_date).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {wedding.venue_name && (
                <p className="text-gray-500 text-sm mb-3 flex items-center justify-center gap-1">
                  <MapPin size={12} />
                  {wedding.venue_name}
                </p>
              )}

              {wedding.dress_code && (
                <p className="text-gray-400 text-xs mb-3">
                  Dress code: {wedding.dress_code}
                </p>
              )}

              {wedding.welcome_message && (
                <p
                  className="text-sm italic mb-4 leading-relaxed"
                  style={{ color: `${primary}cc` }}
                >
                  {wedding.welcome_message}
                </p>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ backgroundColor: `${primary}40` }} />
                <span style={{ color: primary }}>✦</span>
                <div className="flex-1 h-px" style={{ backgroundColor: `${primary}40` }} />
              </div>

              <div
                className="mb-5 p-4 rounded-2xl"
                style={{ backgroundColor: `${primary}15` }}
              >
                <p className="text-xs text-gray-400 mb-1">You are invited,</p>
                <p className="font-bold text-gray-800 text-xl">{guest.name}</p>
              </div>

              <div className="space-y-2 mb-5">
                {wedding.maps_url && (
                  <a
                    href={wedding.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-sm font-medium"
                    style={{ borderColor: `${primary}40`, color: primary }}
                  >
                    📍 Get Directions
                  </a>
                )}
                {wedding.existing_website_url && (
                  <a
                    href={wedding.existing_website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border text-sm font-medium"
                    style={{ borderColor: `${primary}40`, color: primary }}
                  >
                    🌐 Visit Wedding Website
                  </a>
                )}
                {wedding.directions && (
                  <div
                    className="p-3 rounded-xl text-left text-xs"
                    style={{ backgroundColor: `${primary}10` }}
                  >
                    <p
                      className="font-medium mb-1"
                      style={{ color: primary }}
                    >
                      Directions
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      {wedding.directions}
                    </p>
                  </div>
                )}
              </div>

              {guest.rsvp_status !== 'pending' ? (
                <div className="space-y-3">
                  <div
                    className="p-3 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: `${primary}20`, color: primary }}
                  >
                    You have already responded
                  </div>
                  <button
                    onClick={() => setStep('form')}
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-base hover:opacity-90"
                    style={{ backgroundColor: primary }}
                  >
                    Update My RSVP
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setStep('form')}
                  className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:opacity-90"
                  style={{ backgroundColor: primary }}
                >
                  RSVP Now 💌
                </button>
              )}

              {wedding.rsvp_deadline && (
                <p className="text-xs text-gray-400 mt-3">
                  Please respond by{' '}
                  {new Date(wedding.rsvp_deadline).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </p>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-300 mt-6">
            Made with love by WeddingInvite
          </p>
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
        <div className="text-center mb-8">
          <Heart
            size={20}
            className="mx-auto mb-2"
            style={{ color: primary }}
            fill={primary}
          />
          <h2 className="text-2xl font-bold text-gray-800">
            {wedding.couple_names}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {guest.name}, will you be joining us?
          </p>
        </div>

        <div
          className="bg-white rounded-2xl shadow-lg p-6 border"
          style={{ borderColor: `${primary}20` }}
        >
          {isDeadlinePassed && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-center">
              <p className="text-red-600 font-medium text-sm">
                The RSVP deadline has passed
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

          {guest.category === 'couple' && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Who will be attending?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'mr', label: 'Mr only' },
                  { value: 'mrs', label: 'Mrs only' },
                  { value: 'both', label: 'Both of us' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setCoupleAttendance(opt.value)}
                    className="py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition"
                    style={
                      coupleAttendance === opt.value
                        ? {
                          borderColor: primary,
                          backgroundColor: primary,
                          color: 'white',
                        }
                        : { borderColor: '#e5e7eb', color: '#6b7280' }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm font-medium text-gray-700 mb-3">Your response</p>
          <div className="space-y-3 mb-6">
            {RSVP_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setResponse(opt.key)}
                disabled={isDeadlinePassed}
                className="w-full text-left px-4 py-3.5 rounded-xl border-2 transition flex items-center gap-3 disabled:opacity-50"
                style={
                  response === opt.key
                    ? {
                      borderColor: primary,
                      backgroundColor: primary,
                      color: 'white',
                    }
                    : {
                      borderColor: '#f3f4f6',
                      backgroundColor: '#f9fafb',
                      color: '#374151',
                    }
                }
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>

          {isAttending && guest.allow_plus_one && (
            <div
              className="mb-4 p-4 rounded-xl border"
              style={{
                backgroundColor: `${primary}10`,
                borderColor: `${primary}30`,
              }}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantsPlusOne}
                  onChange={e => setWantsPlusOne(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: primary }}>
                    I would like to bring a plus one
                  </p>
                  <p className="text-xs text-gray-500">
                    Subject to approval from the couple
                  </p>
                </div>
              </label>
            </div>
          )}

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
            disabled={!response || loading || isDeadlinePassed}
            className="w-full py-4 rounded-xl text-white font-bold transition disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: primary }}
          >
            {isDeadlinePassed
              ? 'RSVP Deadline Passed'
              : loading
                ? 'Sending RSVP...'
                : 'Send RSVP 💌'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-300 mt-8">
          Made with love by WeddingInvite
        </p>
      </div>
    </div>
  )
}
