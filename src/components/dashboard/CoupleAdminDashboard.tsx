'use client'

import Link from 'next/link'
import { Heart, Users, CheckCircle, Clock, ArrowRight, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Guest {
  id: string
  rsvp_status: string
  invite_status: string
}

interface Wedding {
  id: string
  couple_names: string
  event_date: string | null
  venue_name: string | null
  primary_color: string
}

interface Props {
  profile: { full_name: string | null }
  wedding: Wedding | null
  guests: Guest[]
}

export default function CoupleAdminDashboard({ profile, wedding, guests }: Props) {
  if (!wedding) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">💍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No wedding set up yet
          </h2>
          <p className="text-gray-500">
            Your wedding hasn't been configured yet. Please contact your administrator.
          </p>
        </div>
      </div>
    )
  }

  const totalGuests = guests.length
  const responded = guests.filter(g => g.rsvp_status !== 'pending').length
  const attending = guests.filter(g =>
    g.rsvp_status === 'yes' || g.rsvp_status === 'yes_joy'
  ).length

  const pending = totalGuests - responded

  const rsvpRate =
    totalGuests > 0
      ? Math.round((responded / totalGuests) * 100)
      : 0

  const daysUntil = wedding.event_date
    ? Math.ceil(
        (new Date(wedding.event_date).getTime() - new Date().getTime()) /
          86400000
      )
    : null

  const primaryColor = wedding.primary_color || '#D4A373'

  const rsvpBreakdown = [
    {
      label: 'Yes',
      count: guests.filter(g => g.rsvp_status === 'yes').length,
      color: '#10b981'
    },
    {
      label: 'With Joy',
      count: guests.filter(g => g.rsvp_status === 'yes_joy').length,
      color: '#f59e0b'
    },
    {
      label: 'Not Attending',
      count: guests.filter(g => g.rsvp_status === 'no').length,
      color: '#ef4444'
    },
    {
      label: 'From Afar',
      count: guests.filter(g => g.rsvp_status === 'from_afar').length,
      color: '#8b5cf6'
    },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Heart size={20} className="text-amber-500" fill="#f59e0b" />
          <h1 className="text-2xl font-bold text-gray-800">
            {wedding.couple_names}
          </h1>
        </div>

        <div className="flex items-center gap-3 text-gray-500 text-sm">
          <Calendar size={14} />

          {wedding.event_date
            ? new Date(wedding.event_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Date not set'}

          {daysUntil !== null && daysUntil > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium text-white ml-1"
              style={{ backgroundColor: primaryColor }}
            >
              {daysUntil} days to go! 🎉
            </span>
          )}
        </div>

        {wedding.venue_name && (
          <p className="text-gray-400 text-sm mt-1">
            📍 {wedding.venue_name}
          </p>
        )}
      </div>


      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Guests', value: totalGuests, icon: Users },
          { label: 'Responded', value: `${responded} (${rsvpRate}%)`, icon: CheckCircle },
          { label: 'Attending', value: attending, icon: Heart },
          { label: 'Pending', value: pending, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
              <Icon size={18} className="text-amber-600" />
            </div>

            <p className="text-xl font-bold text-gray-800">
              {value}
            </p>

            <p className="text-xs text-gray-400 mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>


      {/* RSVP Progress */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">
            RSVP Progress
          </h3>

          <span className="text-sm text-gray-500">
            {rsvpRate}% complete
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${rsvpRate}%`,
              backgroundColor: primaryColor
            }}
          />
        </div>


        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {rsvpBreakdown.map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-2">

              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />

              <span className="text-xs text-gray-500">
                {label}: <strong>{count}</strong>
              </span>

            </div>
          ))}
        </div>
      </div>

      {/* RSVP Link Banner */}
<div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-4">
  <div className="flex items-center justify-between flex-wrap gap-3">
    <div>
      <p className="text-sm font-bold text-amber-800 mb-0.5">
        Your Public RSVP Page
      </p>
      <p className="text-xs text-amber-600">
        Share this link with guests who don't have a personal invite
      </p>
    </div>
    <CopyLinkButton weddingId={wedding.id} />
  </div>
</div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {[
          {
            href: '/dashboard/guests',
            label: 'Manage Guests',
            desc: 'Add, edit, or remove guests',
            emoji: '👥'
          },
          {
            href: '/dashboard/invites',
            label: 'Send Invites',
            desc: 'Share invite links via email',
            emoji: '📬'
          },
          {
            href: '/dashboard/tables',
            label: 'Seating Plan',
            desc: 'Assign guests to tables',
            emoji: '🪑'
          },
        ].map(({ href, label, desc, emoji }) => (

          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-amber-200 hover:shadow-md transition group"
          >

            <div className="text-2xl mb-3">
              {emoji}
            </div>

            <h4 className="font-bold text-gray-800 mb-1">
              {label}
            </h4>

            <p className="text-sm text-gray-400 mb-4">
              {desc}
            </p>

            <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
              Go
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>

          </Link>

        ))}

      </div>

    </div>
  )
}

function CopyLinkButton({ weddingId }: { weddingId: string }) {
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(`${window.location.origin}/rsvp/open/${weddingId}`)
  }, [weddingId])

  const copy = () => {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      {url && (
        <code className="text-xs bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg max-w-xs truncate">
          {url}
        </code>
      )}
      <button
        onClick={copy}
        className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition font-medium flex-shrink-0"
      >
        {copied ? '✓ Copied!' : 'Copy Link'}
      </button>
    </div>
  )
}