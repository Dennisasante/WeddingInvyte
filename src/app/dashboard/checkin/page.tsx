import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CheckInManager from '@/components/checkin/CheckInManager'

export default async function CheckInPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  if (profile.role === 'super_admin') {
    const { data: weddings } = await supabase
      .from('weddings')
      .select('id, couple_names, event_date')
      .eq('is_active', true)
      .order('event_date')

    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Guest Check-In</h1>
        <p className="text-gray-500 text-sm mb-6">
          Select a wedding to open check-in mode
        </p>
        <div className="space-y-3">
          {(weddings || []).map(w => (
            <Link
              key={w.id}
              href={`/dashboard/checkin/${w.id}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-amber-200 hover:shadow-md transition"
            >
              <p className="font-bold text-gray-800">{w.couple_names}</p>
              <p className="text-sm text-gray-400 mt-1">
                {w.event_date
                  ? new Date(w.event_date).toLocaleDateString('en-US', {
                      weekday: 'long', year: 'numeric',
                      month: 'long', day: 'numeric',
                    })
                  : 'Date not set'}
              </p>
            </Link>
          ))}
          {(!weddings || weddings.length === 0) && (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <p>No active weddings found</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Couple Admin
  if (!profile.wedding_id) redirect('/dashboard')

  const { data: guests } = await supabase
    .from('guests')
    .select('*, seating_assignments(reception_tables(name))')
    .eq('wedding_id', profile.wedding_id)
    .is('deleted_at', null)
    .order('name')

  return (
    <CheckInManager
      guests={guests || []}
      weddingId={profile.wedding_id}
    />
  )
}