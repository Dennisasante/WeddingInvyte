'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Palette, Calendar, MapPin, Image, Heart } from 'lucide-react'

interface Wedding {
  id: string
  couple_names: string
  slug: string
  event_date: string | null
  venue_name: string | null
  venue_address: string | null
  welcome_message: string | null
  dress_code: string | null
  rsvp_deadline: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  theme_preset: string
  cover_photo_url: string | null
  is_active: boolean
  existing_website_url: string | null
  directions: string | null
  maps_url: string | null
}

const THEME_PRESETS = [
  {
    key: 'classic_gold',
    label: 'Classic Gold',
    primary: '#D4A373',
    secondary: '#FEFAE0',
    accent: '#CCD5AE',
  },
  {
    key: 'modern_teal',
    label: 'Modern Teal',
    primary: '#264653',
    secondary: '#F4F1DE',
    accent: '#2A9D8F',
  },
  {
    key: 'rustic_earthy',
    label: 'Rustic Earthy',
    primary: '#8B5E3C',
    secondary: '#F5F0E8',
    accent: '#A3856B',
  },
  {
    key: 'custom',
    label: 'Custom',
    primary: null,
    secondary: null,
    accent: null,
  },
]

export default function WeddingEditor({ wedding }: { wedding: Wedding }) {
  const [form, setForm] = useState({
    couple_names: wedding.couple_names || '',
    event_date: wedding.event_date || '',
    venue_name: wedding.venue_name || '',
    venue_address: wedding.venue_address || '',
    welcome_message: wedding.welcome_message || '',
    dress_code: wedding.dress_code || '',
    rsvp_deadline: wedding.rsvp_deadline || '',
    primary_color: wedding.primary_color || '#D4A373',
    secondary_color: wedding.secondary_color || '#FEFAE0',
    accent_color: wedding.accent_color || '#CCD5AE',
    theme_preset: wedding.theme_preset || 'classic_gold',
    existing_website_url: wedding.existing_website_url || '',
    directions: wedding.directions || '',
    maps_url: wedding.maps_url || '',
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [coverUrl, setCoverUrl] = useState(wedding.cover_photo_url || '')
  const supabase = createClient()

  const handleThemeSelect = (preset: typeof THEME_PRESETS[0]) => {
    if (preset.key === 'custom') {
      setForm(prev => ({ ...prev, theme_preset: 'custom' }))
      return
    }
    setForm(prev => ({
      ...prev,
      theme_preset: preset.key,
      primary_color: preset.primary!,
      secondary_color: preset.secondary!,
      accent_color: preset.accent!,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

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
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        accent_color: form.accent_color,
        theme_preset: form.theme_preset,
        cover_photo_url: coverUrl || null,
        existing_website_url: form.existing_website_url.trim() || null,
        directions: form.directions.trim() || null,
        maps_url: form.maps_url.trim() || null,
      })
      .eq('id', wedding.id)

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }


  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }

    setUploadingCover(true)
    setError('')

    const fileExt = file.name.split('.').pop()
    const fileName = `${wedding.id}/cover.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('wedding-covers')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      setError('Failed to upload image: ' + uploadError.message)
      setUploadingCover(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('wedding-covers')
      .getPublicUrl(fileName)

    setCoverUrl(publicUrl)
    setUploadingCover(false)
  }

  const field = (
    label: string,
    key: keyof typeof form,
    opts: {
      type?: string
      placeholder?: string
      textarea?: boolean
    } = {}
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {opts.textarea ? (
        <textarea
          value={form[key]}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
          placeholder={opts.placeholder}
        />
      ) : (
        <input
          type={opts.type || 'text'}
          value={form[key]}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
          placeholder={opts.placeholder}
        />
      )}
    </div>
  )

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Wedding Details</h1>
          <p className="text-gray-500 text-sm mt-1">
            Edit your wedding information and theme
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-60"
        >
          <Save size={15} />
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">
          ✅ Wedding details saved successfully!
        </div>
      )}

      <div className="space-y-6">

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Heart size={18} className="text-amber-500" />
            <h2 className="font-bold text-gray-800">Basic Information</h2>
          </div>
          <div className="space-y-4">
            {field('Couple Names', 'couple_names', {
              placeholder: 'Emma & James'
            })}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field('Wedding Date', 'event_date', { type: 'date' })}
              {field('RSVP Deadline', 'rsvp_deadline', { type: 'date' })}
            </div>
            {field('Welcome Message', 'welcome_message', {
              textarea: true,
              placeholder: 'We would love for you to celebrate with us...'
            })}
            {field('Dress Code', 'dress_code', {
              placeholder: 'Black tie, Smart casual, etc.'
            })}
            {field('Your Wedding Website', 'existing_website_url', {
              placeholder: 'https://yourweddingwebsite.com (optional)',
            })}

            {field('Directions to Venue', 'directions', {
              textarea: true,
              placeholder: 'E.g. From the airport, take the N1 highway towards Accra...',
            })}

            {field('Google Maps Link', 'maps_url', {
              placeholder: 'https://maps.google.com/...',
            })}
          </div>
        </div>

        {/* Venue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={18} className="text-amber-500" />
            <h2 className="font-bold text-gray-800">Venue</h2>
          </div>
          <div className="space-y-4">
            {field('Venue Name', 'venue_name', {
              placeholder: 'The Grand Ballroom'
            })}
            {field('Venue Address', 'venue_address', {
              placeholder: 'Accra, Ghana',
              textarea: true
            })}
          </div>
        </div>

        {/* Cover Photo */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Image size={18} className="text-amber-500" />
            <h2 className="font-bold text-gray-800">Cover Photo</h2>
          </div>

          {coverUrl ? (
            <div className="relative">
              <img
                src={coverUrl}
                alt="Cover"
                className="w-full h-48 object-cover rounded-xl mb-3"
              />
              <button
                onClick={() => setCoverUrl('')}
                className="text-sm text-red-500 hover:underline"
              >
                Remove photo
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 hover:bg-amber-50 transition">
              <Image size={24} className="text-gray-300 mb-2" />
              <span className="text-sm font-medium text-gray-500">
                {uploadingCover ? 'Uploading...' : 'Click to upload cover photo'}
              </span>
              <span className="text-xs text-gray-400 mt-1">JPG, PNG or WebP — max 5MB</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleCoverUpload}
                disabled={uploadingCover}
              />
            </label>
          )}
        </div>

        {/* Theme */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Palette size={18} className="text-amber-500" />
            <h2 className="font-bold text-gray-800">Theme & Colors</h2>
          </div>

          {/* Preset Selector */}
          <p className="text-sm text-gray-500 mb-3">Choose a preset</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {THEME_PRESETS.map(preset => (
              <button
                key={preset.key}
                onClick={() => handleThemeSelect(preset)}
                className={`p-3 rounded-xl border-2 text-left transition ${form.theme_preset === preset.key
                  ? 'border-amber-400 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200'
                  }`}
              >
                {preset.key !== 'custom' ? (
                  <div className="flex gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.primary! }} />
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.secondary! }} />
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.accent! }} />
                  </div>
                ) : (
                  <div className="flex gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-purple-500" />
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-teal-500" />
                  </div>
                )}
                <p className="text-xs font-medium text-gray-700">{preset.label}</p>
              </button>
            ))}
          </div>

          {/* Color Pickers */}
          <p className="text-sm text-gray-500 mb-3">
            {form.theme_preset === 'custom' ? 'Set your custom colors' : 'Fine-tune colors'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Primary', key: 'primary_color' as const },
              { label: 'Secondary', key: 'secondary_color' as const },
              { label: 'Accent', key: 'accent_color' as const },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form[key]}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      [key]: e.target.value,
                      theme_preset: 'custom'
                    }))}
                    className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={form[key]}
                    onChange={e => setForm(prev => ({
                      ...prev,
                      [key]: e.target.value,
                      theme_preset: 'custom'
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-200"
                    maxLength={7}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Live Preview */}
          <div className="mt-6 rounded-xl overflow-hidden border border-gray-100">
            <div
              className="p-6 text-center"
              style={{ backgroundColor: form.secondary_color }}
            >
              <p className="text-xs uppercase tracking-widest mb-2"
                style={{ color: form.accent_color }}>
                Preview
              </p>
              <h3 className="text-2xl font-bold mb-1"
                style={{ color: form.primary_color }}>
                {form.couple_names || 'Emma & James'}
              </h3>
              <button
                className="mt-3 px-6 py-2 rounded-full text-white text-sm font-medium"
                style={{ backgroundColor: form.primary_color }}
              >
                RSVP Now 💌
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Save */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saving...' : saved ? '✓ All changes saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}