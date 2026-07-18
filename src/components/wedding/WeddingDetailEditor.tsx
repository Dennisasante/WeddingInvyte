'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Edit2, X } from 'lucide-react'

interface Wedding {
  id: string
  couple_names: string
  event_date: string | null
  venue_name: string | null
  venue_address: string | null
  welcome_message: string | null
  dress_code: string | null
  rsvp_deadline: string | null
  primary_color: string
}

export default function WeddingDetailEditor({ wedding }: { wedding: Wedding }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    couple_names: wedding.couple_names,
    event_date: wedding.event_date || '',
    venue_name: wedding.venue_name || '',
    venue_address: wedding.venue_address || '',
    welcome_message: wedding.welcome_message || '',
    dress_code: wedding.dress_code || '',
    rsvp_deadline: wedding.rsvp_deadline || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSave = async () => {
    setSaving(true)
    setError('')

    const { error } = await supabase
      .from('weddings')
      .update({
        couple_names: form.couple_names.trim(),
        event_date: form.event_date || null,
        venue_name: form.venue_name.trim() || null,
        venue_address: form.venue_address.trim() || null,
        welcome_message: form.welcome_message.trim() || null,
        dress_code: form.dress_code.trim() || null,
        rsvp_deadline: form.rsvp_deadline || null,
      })
      .eq('id', wedding.id)

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const fields = [
    { label: 'Couple Names', key: 'couple_names' as const, type: 'text' },
    { label: 'Wedding Date', key: 'event_date' as const, type: 'date' },
    { label: 'RSVP Deadline', key: 'rsvp_deadline' as const, type: 'date' },
    { label: 'Venue Name', key: 'venue_name' as const, type: 'text' },
    { label: 'Venue Address', key: 'venue_address' as const, type: 'text' },
    { label: 'Dress Code', key: 'dress_code' as const, type: 'text' },
    { label: 'Welcome Message', key: 'welcome_message' as const, type: 'textarea' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-800">Wedding Details</h3>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-green-600 font-medium">✅ Saved!</span>
          )}
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 text-sm px-3 py-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"
              >
                <X size={14} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-sm px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl disabled:opacity-60"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition"
            >
              <Edit2 size={14} />
              Edit Details
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {editing ? (
        <div className="grid grid-cols-2 gap-4">
          {fields.map(({ label, key, type }) => (
            <div key={key} className={type === 'textarea' ? 'col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              {type === 'textarea' ? (
                <textarea
                  value={form[key]}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
                />
              ) : (
                <input
                  type={type}
                  value={form[key]}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {fields.map(({ label, key }) => (
            <div key={key} className={key === 'welcome_message' ? 'col-span-2' : ''}>
              <p className="text-xs text-gray-400 mb-0.5">{label}</p>
              <p className="text-sm text-gray-800 font-medium">
                {form[key] || '—'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}