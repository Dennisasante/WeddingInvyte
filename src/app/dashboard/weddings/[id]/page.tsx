import ToggleStatusButton from '@/components/wedding/ToggleStatusButton'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Heart, ArrowLeft,
  ToggleLeft, ToggleRight, Trash2
} from 'lucide-react'

export default async function WeddingDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/dashboard')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!wedding) return notFound()

  const { data: coupleAdmin } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('wedding_id', params.id)
    .eq('role', 'couple_admin')
    .single()

  const { data: guests } = await supabase
    .from('guests')
    .select('id, rsvp_status')
    .eq('wedding_id', params.id)
    .is('deleted_at', null)

  const attending = (guests || []).filter(g =>
    g.rsvp_status === 'yes' || g.rsvp_status === 'yes_joy'
  ).length

  const responded = (guests || []).filter(g =>
    g.rsvp_status !== 'pending'
  ).length

  const rsvpRate = (guests || []).length > 0
    ? Math.round((responded / (guests || []).length) * 100)
    : 0

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard/weddings"
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition"
      >
        <ArrowLeft size={16} />
        Back to all weddings
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: wedding.primary_color || '#D4A373' }}
            />
            <h1 className="text-2xl font-bold text-gray-800">
              {wedding.couple_names}
            </h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              wedding.is_active
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {wedding.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            {wedding.event_date
              ? new Date(wedding.event_date).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric',
                  month: 'long', day: 'numeric'
                })
              : 'Date not set'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Guests', value: (guests || []).length, icon: Users },
          { label: 'Attending', value: attending, icon: Heart },
          { label: 'RSVP Rate', value: `${rsvpRate}%`, icon: Heart },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
              <Icon size={18} className="text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Editable Wedding Details */}
        <div className="col-span-2">
          <WeddingDetailEditor wedding={wedding} />
        </div>


      <div className="grid grid-cols-2 gap-6">
        {/* Wedding Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Wedding Info</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Venue', value: wedding.venue_name },
              { label: 'Address', value: wedding.venue_address },
              { label: 'Dress Code', value: wedding.dress_code },
              { label: 'RSVP Deadline', value: wedding.rsvp_deadline
                  ? new Date(wedding.rsvp_deadline).toLocaleDateString()
                  : null },
              { label: 'Theme', value: wedding.theme_preset },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-gray-400">{label}</span>
                <span className="text-gray-700 font-medium text-right max-w-48 truncate">
                  {value || '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Couple Admin */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Couple Admin</h3>
          {coupleAdmin ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center font-bold text-amber-800">
                  {coupleAdmin.full_name?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{coupleAdmin.full_name}</p>
                  <p className="text-xs text-gray-400">Couple Admin</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">No admin assigned yet</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-4 space-y-2">
            <ToggleStatusButton
              weddingId={wedding.id}
              isActive={wedding.is_active}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
