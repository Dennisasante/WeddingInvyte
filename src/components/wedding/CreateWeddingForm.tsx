'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Heart, User } from 'lucide-react'

export default function CreateWeddingForm() {
  const [form, setForm] = useState({
    couple_names: '',
    slug: '',
    event_date: '',
    venue_name: '',
    admin_email: '',
    admin_name: '',
    admin_password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const generateSlug = (names: string) => {
    return names
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  const handleCoupleNamesChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      couple_names: value,
      slug: generateSlug(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Step 1: Create the wedding
      const { data: wedding, error: weddingError } = await supabase
        .from('weddings')
        .insert({
          couple_names: form.couple_names.trim(),
          slug: form.slug.trim(),
          event_date: form.event_date || null,
          venue_name: form.venue_name.trim() || null,
          is_active: true,
        })
        .select()
        .single()

      if (weddingError) throw new Error(weddingError.message)

      // Step 2: Create the couple admin account via API
      const response = await fetch('/api/admin/create-couple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.admin_email.trim(),
          password: form.admin_password,
          fullName: form.admin_name.trim(),
          weddingId: wedding.id,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to create admin')

      router.push(`/dashboard/weddings/${wedding.id}`)
      router.refresh()

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Create New Wedding</h1>
        <p className="text-gray-500 text-sm mt-1">
          Set up a wedding and create the couple's admin account
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Wedding Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Heart size={18} className="text-amber-500" />
            <h2 className="font-bold text-gray-800">Wedding Details</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couple Names <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.couple_names}
                onChange={e => handleCoupleNamesChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="Emma & James"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.slug}
                onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 font-mono"
                placeholder="emma-and-james"
              />
              <p className="text-xs text-gray-400 mt-1">
                Used in the RSVP URL — no spaces or special characters
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wedding Date
                </label>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={e => setForm(prev => ({ ...prev, event_date: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Name
                </label>
                <input
                  value={form.venue_name}
                  onChange={e => setForm(prev => ({ ...prev, venue_name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                  placeholder="The Grand Ballroom"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Couple Admin Account */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-amber-500" />
            <h2 className="font-bold text-gray-800">Couple Admin Account</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.admin_name}
                onChange={e => setForm(prev => ({ ...prev, admin_name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="Emma & James"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                value={form.admin_email}
                onChange={e => setForm(prev => ({ ...prev, admin_email: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="couple@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temporary Password <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="password"
                value={form.admin_password}
                onChange={e => setForm(prev => ({ ...prev, admin_password: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="Minimum 8 characters"
                minLength={8}
              />
              <p className="text-xs text-gray-400 mt-1">
                Share this with the couple — they can change it after logging in
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl font-bold transition disabled:opacity-60"
        >
          {loading ? 'Creating...' : 'Create Wedding & Admin Account'}
        </button>
      </form>
    </div>
  )
}