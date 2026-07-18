import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Heart } from 'lucide-react'

export default async function WeddingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/dashboard')

  const { data: weddings } = await supabase
    .from('weddings')
    .select('*, profiles!wedding_id(full_name, id)')
    .order('created_at', { ascending: false })

  const { data: guestCounts } = await supabase
    .from('guests')
    .select('wedding_id')
    .is('deleted_at', null)

  const countByWedding = (guestCounts || []).reduce((acc, g) => {
    acc[g.wedding_id] = (acc[g.wedding_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Weddings</h1>
          <p className="text-gray-500 text-sm mt-1">
            {weddings?.length || 0} weddings on the platform
          </p>
        </div>
        <Link
          href="/dashboard/weddings/new"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          <Plus size={16} />
          New Wedding
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(weddings || []).map(wedding => (
          <div
            key={wedding.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition"
          >
            {/* Color Banner */}
            <div
              className="h-3"
              style={{ backgroundColor: wedding.primary_color || '#D4A373' }}
            />

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{wedding.couple_names}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {wedding.event_date
                      ? new Date(wedding.event_date).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })
                      : 'Date not set'}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  wedding.is_active
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {wedding.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {wedding.venue_name && (
                <p className="text-xs text-gray-400 mb-3">
                  📍 {wedding.venue_name}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">
                  👥 {countByWedding[wedding.id] || 0} guests
                </span>
                <Link
                  href={`/dashboard/weddings/${wedding.id}`}
                  className="text-xs text-amber-600 hover:underline font-medium"
                >
                  Manage →
                </Link>
              </div>
            </div>
          </div>
        ))}

        {(!weddings || weddings.length === 0) && (
          <div className="col-span-3 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center text-gray-400">
            <Heart size={40} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium">No weddings yet</p>
            <p className="text-sm mt-1">Create your first wedding to get started</p>
            <Link
              href="/dashboard/weddings/new"
              className="inline-flex items-center gap-2 mt-4 bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 transition"
            >
              <Plus size={14} />
              Create Wedding
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}