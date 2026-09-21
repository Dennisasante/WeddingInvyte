'use client'
import { logActivity } from '@/lib/logActivity'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import PlusOnePicker, { PickableGuest } from './PlusOnePicker'

interface Props {
  weddingId: string
  onClose: () => void
  onGuestAdded: (guest: any) => void
  allGuests?: PickableGuest[]
}

export default function AddGuestModal({ weddingId, onClose, onGuestAdded, allGuests = [] }: Props) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'individual',
    allow_plus_one: false,
    notes: '',
    partner_name: '',
    partner_phone: '',
  })
  const [plusOneOf, setPlusOneOf] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  // A couple is two guests: each partner gets their own row (so counts and
  // seating are per person), linked to each other through partner_id.
  const addCouple = async () => {
    const shared = {
      wedding_id: weddingId,
      category: 'couple',
      allow_plus_one: false,
      notes: form.notes.trim() || null,
    }

    const { data: first, error: firstError } = await supabase
      .from('guests')
      .insert({
        ...shared,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
      })
      .select()
      .single()

    if (firstError) {
      setError(firstError.message)
      setLoading(false)
      return
    }

    const { data: second, error: secondError } = await supabase
      .from('guests')
      .insert({
        ...shared,
        name: form.partner_name.trim(),
        phone: form.partner_phone.trim() || null,
        partner_id: first.id,
      })
      .select()
      .single()

    if (secondError) {
      // Don't leave half a couple behind.
      await supabase
        .from('guests')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', first.id)
      setError(secondError.message)
      setLoading(false)
      return
    }

    const { error: linkError } = await supabase
      .from('guests')
      .update({ partner_id: second.id })
      .eq('id', first.id)

    if (linkError) {
      setError(linkError.message)
      setLoading(false)
      return
    }

    await logActivity({
      weddingId,
      action: 'guest_added',
      entityType: 'guest',
      entityId: first.id,
      details: { name: form.name, partner: form.partner_name, couple: true },
    })
    onGuestAdded({ ...first, partner_id: second.id })
    onGuestAdded({ ...second })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.category === 'couple') {
      await addCouple()
      return
    }

    const { data, error } = await supabase
      .from('guests')
      .insert({
        wedding_id: weddingId,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        category: form.category,
        allow_plus_one: form.allow_plus_one,
        notes: form.notes.trim() || null,
        is_plus_one_of: form.category === 'plus_one' ? plusOneOf : null,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      await logActivity({
        weddingId,
        action: 'guest_added',
        entityType: 'guest',
        entityId: data.id,
        details: { name: form.name },
      })
      onGuestAdded(data)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Add Guest</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.category === 'couple' ? 'First partner' : 'Full Name'} <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder={form.category === 'couple' ? 'Mr John Mensah' : 'Jane Doe'}
            />
          </div>

          {form.category === 'couple' && (
            <div className="p-3 bg-pink-50 rounded-xl border border-pink-100 space-y-3">
              <p className="text-xs text-pink-700">
                A couple is added as two guests, so counts and seating are per person.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Second partner <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.partner_name}
                  onChange={e => setForm({ ...form, partner_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white"
                  placeholder="Mrs Jane Mensah"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Second partner's WhatsApp number
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <input
                  value={form.partner_phone}
                  onChange={e => setForm({ ...form, partner_phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white"
                  placeholder="0XX XXX XXXX"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="jane@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Whatsapp Number</label>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="+233 / 0XX XXX XXXX (Ghana number)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guest Type</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white"
            >
              <option value="individual">Individual</option>
              <option value="couple">Couple (Mr & Mrs) — counts as 2</option>
              <option value="plus_one">Plus One</option>
            </select>
          </div>

          {form.category === 'plus_one' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plus one of
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <PlusOnePicker guests={allGuests} value={plusOneOf} onChange={setPlusOneOf} />
            </div>
          )}

          {form.category !== 'couple' && form.category !== 'plus_one' && (
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-amber-50 rounded-xl border border-amber-100">
            <input
              type="checkbox"
              checked={form.allow_plus_one}
              onChange={e => setForm({ ...form, allow_plus_one: e.target.checked })}
              className="w-4 h-4 rounded accent-amber-500"
            />
            <div>
              <p className="text-sm font-medium text-amber-800">Allow plus one request</p>
              <p className="text-xs text-amber-600">Guest adds their plus one's name and number when they RSVP</p>
            </div>
          </label>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
              placeholder="Any special notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-60"
            >
              {loading ? 'Adding...' : 'Add Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}