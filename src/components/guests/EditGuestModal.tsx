'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import PlusOnePicker, { PickableGuest } from './PlusOnePicker'
import GuestPicker from './GuestPicker'

interface Guest {
  id: string
  name: string
  email: string | null
  phone: string | null
  category: string
  allow_plus_one: boolean
  notes: string | null
  rsvp_status: string
  invite_status: string
  dietary_restrictions: string | null
  wedding_id: string
  created_at: string
  partner_id?: string | null
  is_plus_one_of?: string | null
}

interface Props {
  guest: Guest
  onClose: () => void
  onUpdated: (guest: Guest) => void
  onPartnerAdded?: (guest: Guest) => void
  // Another guest changed as a side effect (e.g. their partner was linked or unlinked)
  onGuestChanged?: (guest: Guest) => void
  allGuests?: PickableGuest[]
}

export default function EditGuestModal({ guest, onClose, onUpdated, onPartnerAdded, onGuestChanged, allGuests = [] }: Props) {
  const [form, setForm] = useState({
    name: guest.name,
    email: guest.email || '',
    phone: guest.phone || '',
    category: guest.category,
    allow_plus_one: guest.allow_plus_one,
    notes: guest.notes || '',
    partner_name: '',
    partner_phone: '',
  })
  const [plusOneOf, setPlusOneOf] = useState<string | null>(guest.is_plus_one_of || null)
  const [partnerLinkId, setPartnerLinkId] = useState<string | null>(null)
  const [unlinkPartner, setUnlinkPartner] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  // A 'couple' saved as a single row still counts as two people; naming the
  // partner turns it into two guests so seating and counts are per person.
  const needsPartner = form.category === 'couple' && !guest.partner_id

  // The linked partner, if any, and who could be linked as one: individuals
  // not already paired up (a one-row couple would count wrongly if merged).
  const currentPartner = guest.partner_id ? allGuests.find(g => g.id === guest.partner_id) : undefined
  const partnerCandidates = allGuests.filter(g =>
    g.id !== guest.id && g.category === 'individual' && !g.partner_id
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('guests')
      .update({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        category: form.category,
        allow_plus_one: form.allow_plus_one,
        notes: form.notes.trim() || null,
        is_plus_one_of: form.category === 'plus_one' ? plusOneOf : null,
      })
      .eq('id', guest.id)
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Unlinking makes both people individuals again (otherwise each would be
    // counted as a whole couple).
    if (unlinkPartner && guest.partner_id) {
      const { data: rows, error: unlinkError } = await supabase
        .from('guests')
        .update({ partner_id: null, category: 'individual' })
        .in('id', [guest.id, guest.partner_id])
        .select()

      if (unlinkError) {
        setError(unlinkError.message)
        setLoading(false)
        return
      }
      const mine = rows?.find(r => r.id === guest.id)
      const other = rows?.find(r => r.id === guest.partner_id)
      if (other) onGuestChanged?.(other)
      onUpdated(mine || data)
      return
    }

    // Link an existing guest as this guest's partner (both ways).
    if (needsPartner && partnerLinkId) {
      const { data: other, error: otherError } = await supabase
        .from('guests')
        .update({ partner_id: guest.id, category: 'couple' })
        .eq('id', partnerLinkId)
        .select()
        .single()

      if (otherError) {
        setError(otherError.message)
        setLoading(false)
        return
      }

      const { data: mine, error: mineError } = await supabase
        .from('guests')
        .update({ partner_id: partnerLinkId, category: 'couple' })
        .eq('id', guest.id)
        .select()
        .single()

      if (mineError) {
        // Don't leave the link half made.
        await supabase.from('guests').update({ partner_id: null, category: 'individual' }).eq('id', partnerLinkId)
        setError(mineError.message)
        setLoading(false)
        return
      }

      onGuestChanged?.(other)
      onUpdated(mine)
      return
    }

    // A one-row couple gets split into two guests once the partner is named.
    if (needsPartner && form.partner_name.trim()) {
      const { data: partner, error: partnerError } = await supabase
        .from('guests')
        .insert({
          wedding_id: guest.wedding_id,
          name: form.partner_name.trim(),
          phone: form.partner_phone.trim() || null,
          category: 'couple',
          allow_plus_one: false,
          partner_id: guest.id,
          rsvp_status: data.rsvp_status,
          invite_status: data.invite_status,
        })
        .select()
        .single()

      if (partnerError) {
        setError(partnerError.message)
        setLoading(false)
        return
      }

      const { data: linked, error: linkError } = await supabase
        .from('guests')
        .update({ partner_id: partner.id })
        .eq('id', guest.id)
        .select()
        .single()

      if (linkError) {
        setError(linkError.message)
        setLoading(false)
        return
      }

      onPartnerAdded?.(partner)
      onUpdated(linked)
      return
    }

    onUpdated(data)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="font-bold text-gray-800">Edit Guest</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="Jane Doe"
            />
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Number
            </label>
            <input
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
              placeholder="+233 24 000 0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guest Type
            </label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white"
            >
              <option value="individual">Individual</option>
              <option value="couple">Couple (Mr & Mrs)</option>
              <option value="plus_one">Plus One</option>
            </select>
          </div>

          {form.category === 'plus_one' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plus one of</label>
              <PlusOnePicker
                guests={allGuests}
                value={plusOneOf}
                onChange={setPlusOneOf}
                excludeId={guest.id}
              />
            </div>
          )}

          {currentPartner && (
            <div className="p-3 bg-pink-50 rounded-xl border border-pink-100">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-pink-800">
                  Couple with <strong>{currentPartner.name}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setUnlinkPartner(v => !v)}
                  className="text-xs text-pink-600 hover:text-pink-800 underline flex-shrink-0"
                >
                  {unlinkPartner ? 'Keep them together' : 'Unlink'}
                </button>
              </div>
              {unlinkPartner && (
                <p className="text-xs text-pink-600 mt-1.5">
                  On save, both become separate individual guests.
                </p>
              )}
            </div>
          )}

          {needsPartner && (
            <div className="p-3 bg-pink-50 rounded-xl border border-pink-100 space-y-3">
              <p className="text-xs text-pink-700">
                This couple is saved as one entry (counted as 2). Add the partner's
                name to make them their own guest, so each can be seated separately.
              </p>
              <div>
                <p className="text-xs font-medium text-pink-800 mb-1.5">
                  Already on the list as their own guest?
                </p>
                <GuestPicker
                  candidates={partnerCandidates}
                  allGuests={allGuests}
                  value={partnerLinkId}
                  onChange={setPartnerLinkId}
                  placeholder="Search for their partner..."
                  selectedPrefix="Couple with"
                  emptyHint="No match (only individual guests can be linked)"
                />
              </div>
              {!partnerLinkId && (
              <>
              <p className="text-xs text-pink-700">Or add them as a new guest:</p>
              <input
                value={form.partner_name}
                onChange={e => setForm({ ...form, partner_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white"
                placeholder="Partner's name (e.g. Mrs Jane Mensah)"
              />
              <input
                value={form.partner_phone}
                onChange={e => setForm({ ...form, partner_phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 bg-white"
                placeholder="Partner's WhatsApp number (optional)"
              />
              </>
              )}
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer p-3 bg-amber-50 rounded-xl border border-amber-100">
            <input
              type="checkbox"
              checked={form.allow_plus_one}
              onChange={e => setForm({ ...form, allow_plus_one: e.target.checked })}
              className="w-4 h-4 rounded accent-amber-500"
            />
            <div>
              <p className="text-sm font-medium text-amber-800">Allow plus one request</p>
              <p className="text-xs text-amber-600">Guest can request to bring someone</p>
            </div>
          </label>

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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}