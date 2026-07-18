'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Heart } from 'lucide-react'

interface Props {
  request: { id: string; token: string }
  guest: { id: string; name: string } | null
  wedding: {
    couple_names: string
    event_date: string | null
    venue_name: string | null
    primary_color: string
    secondary_color: string
  } | null
}

export default function PlusOneForm({ request, guest, wedding }: Props) {
  const [plusOneName, setPlusOneName] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const primary = wedding?.primary_color || '#D4A373'
  const secondary = wedding?.secondary_color || '#FEFAE0'

  const handleSubmit = async () => {
    if (!plusOneName.trim()) {
      setError('Please enter your name')
      return
    }
    setLoading(true)
    setError('')

    // Update plus one request with the name
    const { error: updateError } = await supabase
      .from('plus_one_requests')
      .update({
        plus_one_name: plusOneName.trim(),
        status: 'completed',
      })
      .eq('id', request.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Update the original guest's plus_one_name
    if (guest?.id) {
      await supabase
        .from('guests')
        .update({ plus_one_name: plusOneName.trim() })
        .eq('id', guest.id)
    }

    setConfirmed(true)
    setLoading(false)
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
            You're all set!
          </h2>
          <p className="text-gray-500 mb-2">
            Welcome, {plusOneName.split(' ')[0]}!
          </p>
          <p className="text-gray-400 text-sm">
            {wedding?.couple_names} can't wait to celebrate with you!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${secondary}cc, white)` }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Heart size={28} className="mx-auto mb-3"
            style={{ color: primary }} fill={primary} />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {wedding?.couple_names}
          </h1>
          <p className="text-gray-500 text-sm">
            {guest?.name} has added you as their plus one! 🎉
          </p>
        </div>

        <div
          className="bg-white rounded-2xl shadow-lg p-6 border"
          style={{ borderColor: `${primary}20` }}
        >
          <h3 className="font-bold text-gray-800 mb-1">
            Welcome! Please enter your name
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            So the couple knows who to expect at the wedding.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Full Name <span className="text-red-500">*</span>
            </label>
            <input
              value={plusOneName}
              onChange={e => setPlusOneName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Jane Doe"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!plusOneName.trim() || loading}
            className="w-full py-4 rounded-xl text-white font-bold transition disabled:opacity-50"
            style={{ backgroundColor: primary }}
          >
            {loading ? 'Saving...' : "Confirm My Attendance 💌"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-300 mt-8">
          Made with ❤️ by WeddingInvite
        </p>
      </div>
    </div>
  )
}