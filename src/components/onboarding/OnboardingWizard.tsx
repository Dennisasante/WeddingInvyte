'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Heart, Calendar, MapPin, Palette, Check } from 'lucide-react'
import { useEffect } from 'react'


interface Props {
  userId: string
  userEmail: string
}

const STEPS = ['Names', 'Date & Venue', 'Theme', 'Done']

const THEME_PRESETS = [
  { key: 'classic_gold', label: 'Classic Gold', primary: '#D4A373', secondary: '#FEFAE0' },
  { key: 'modern_teal', label: 'Modern Teal', primary: '#264653', secondary: '#F4F1DE' },
  { key: 'rustic_earthy', label: 'Rustic Earthy', primary: '#8B5E3C', secondary: '#F5F0E8' },
]

export default function OnboardingWizard({ userId, userEmail }: Props) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    bride_name: '',
    groom_name: '',
    couple_names: '',
    event_date: '',
    venue_name: '',
    venue_address: '',
    rsvp_deadline: '',
    theme_preset: 'classic_gold',
    primary_color: '#D4A373',
    secondary_color: '#FEFAE0',
  })

  // Add inside the component, after all useState declarations
  useEffect(() => {
    // Ensure we have a valid session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/signup')
      }
    }
    checkSession()
  }, [])

  const router = useRouter()
  const supabase = createClient()

  const generateSlug = (bride: string, groom: string) => {
    const combined = `${bride}-and-${groom}`
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
    return `${combined}-${Date.now().toString(36)}`
  }

  const handleCreate = async () => {
    setLoading(true)
    setError('')

    const coupleNames = `${form.bride_name.trim()} & ${form.groom_name.trim()}`
    const slug = generateSlug(form.bride_name, form.groom_name)

    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .insert({
        couple_names: coupleNames,
        slug,
        event_date: form.event_date || null,
        venue_name: form.venue_name.trim() || null,
        venue_address: form.venue_address.trim() || null,
        rsvp_deadline: form.rsvp_deadline || null,
        theme_preset: form.theme_preset,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        created_by: userId,
        is_active: true,
      })
      .select()
      .single()

    if (weddingError) {
      setError(weddingError.message)
      setLoading(false)
      return
    }

    // Log wedding creation
    await fetch('/api/log-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weddingId: wedding.id,
        action: 'wedding_created',
        entityType: 'wedding',
        entityId: wedding.id,
        details: {
          couple_names: coupleNames,
        },
      }),
    }).catch(() => null)

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        wedding_id: wedding.id,
        full_name: coupleNames,
        is_primary_admin: true,
      })
      .eq('id', userId)

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    setStep(3)
    setLoading(false)
  }

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Your wedding is ready!
          </h1>
          <p className="text-gray-500 mb-8">
            {form.bride_name} & {form.groom_name}, welcome to WeddingInvite.
            Your dashboard is all set up and ready to use.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl transition text-lg"
          >
            Go to Dashboard 🎉
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">💍</span>
            <span className="font-bold text-gray-800 text-xl">WeddingInvite</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Set up your wedding</h1>
          <p className="text-gray-400 text-sm mt-1">Takes less than 2 minutes</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.slice(0, 3).map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${i < step ? 'bg-amber-500 text-white' :
                i === step ? 'bg-amber-500 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`ml-2 text-xs font-medium hidden sm:block ${i === step ? 'text-amber-600' : 'text-gray-400'
                }`}>
                {s}
              </span>
              {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-amber-100">
          {/* Step 0 — Names */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Heart size={20} className="text-amber-500" />
                <h2 className="font-bold text-gray-800 text-lg">The happy couple</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bride's Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.bride_name}
                  onChange={e => setForm({ ...form, bride_name: e.target.value })}
                  className={inputClass}
                  placeholder="Emma"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Groom's Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.groom_name}
                  onChange={e => setForm({ ...form, groom_name: e.target.value })}
                  className={inputClass}
                  placeholder="James"
                />
              </div>
              {form.bride_name && form.groom_name && (
                <div className="p-4 bg-amber-50 rounded-xl text-center border border-amber-100">
                  <p className="text-sm text-amber-600 font-medium">
                    {form.bride_name} & {form.groom_name}
                  </p>
                  <p className="text-xs text-amber-400 mt-0.5">Your wedding page name</p>
                </div>
              )}
              <button
                onClick={() => {
                  if (!form.bride_name || !form.groom_name) {
                    setError('Please enter both names')
                    return
                  }
                  setError('')
                  setStep(1)
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 1 — Date & Venue */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Calendar size={20} className="text-amber-500" />
                <h2 className="font-bold text-gray-800 text-lg">Date & Venue</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wedding Date
                </label>
                <input
                  type="date"
                  value={form.event_date}
                  onChange={e => setForm({ ...form, event_date: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RSVP Deadline
                </label>
                <input
                  type="date"
                  value={form.rsvp_deadline}
                  onChange={e => setForm({ ...form, rsvp_deadline: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Name
                </label>
                <input
                  value={form.venue_name}
                  onChange={e => setForm({ ...form, venue_name: e.target.value })}
                  className={inputClass}
                  placeholder="The Grand Ballroom"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Address
                </label>
                <input
                  value={form.venue_address}
                  onChange={e => setForm({ ...form, venue_address: e.target.value })}
                  className={inputClass}
                  placeholder="Accra, Ghana"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => { setError(''); setStep(2) }}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Theme */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Palette size={20} className="text-amber-500" />
                <h2 className="font-bold text-gray-800 text-lg">Choose a theme</h2>
              </div>
              <p className="text-sm text-gray-500">
                You can always change this later from your dashboard.
              </p>
              <div className="space-y-3">
                {THEME_PRESETS.map(preset => (
                  <button
                    key={preset.key}
                    onClick={() => setForm({
                      ...form,
                      theme_preset: preset.key,
                      primary_color: preset.primary,
                      secondary_color: preset.secondary,
                    })}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition ${form.theme_preset === preset.key
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: preset.primary }} />
                      <div className="w-8 h-8 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: preset.secondary }} />
                    </div>
                    <span className="font-medium text-gray-800 text-sm">{preset.label}</span>
                    {form.theme_preset === preset.key && (
                      <Check size={16} className="ml-auto text-amber-500" />
                    )}
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div
                className="rounded-xl overflow-hidden border border-gray-100 mt-4"
                style={{ backgroundColor: form.secondary_color }}
              >
                <div
                  className="p-4 text-center"
                  style={{ backgroundColor: form.primary_color }}
                >
                  <p className="text-white font-bold text-lg">
                    {form.bride_name} & {form.groom_name}
                  </p>
                  <p className="text-white/70 text-xs mt-1">Preview</p>
                </div>
                <div className="p-4 text-center" style={{ backgroundColor: form.secondary_color }}>
                  <button
                    className="px-6 py-2 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: form.primary_color }}
                  >
                    RSVP Now
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
                >
                  {loading ? 'Creating...' : 'Create My Wedding!'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}