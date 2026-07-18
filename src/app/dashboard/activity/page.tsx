import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Activity } from 'lucide-react'

export default async function ActivityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/dashboard')

  const { data: logs } = await supabase
    .from('activity_log')
    .select('*, profiles(full_name), weddings(couple_names)')
    .order('created_at', { ascending: false })
    .limit(100)

  const ACTION_COLORS: Record<string, string> = {
    guest_added:      'bg-blue-50 text-blue-700',
    guest_deleted:    'bg-red-50 text-red-600',
    rsvp_received:    'bg-green-50 text-green-700',
    invite_sent:      'bg-amber-50 text-amber-700',
    wedding_created:  'bg-purple-50 text-purple-700',
    wedding_updated:  'bg-indigo-50 text-indigo-700',
    plus_one_approved:'bg-emerald-50 text-emerald-700',
    plus_one_declined:'bg-red-50 text-red-600',
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
        <p className="text-gray-500 text-sm mt-1">
          Last 100 actions across all weddings
        </p>
      </div>

      <div className="space-y-3">
        {(logs || []).map(log => (
          <div
            key={log.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-4"
          >
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Activity size={16} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'
                }`}>
                  {log.action.replace(/_/g, ' ')}
                </span>
                {log.weddings && (
                  <span className="text-xs text-gray-400">
                    {(log.weddings as { couple_names: string }).couple_names}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {log.profiles
                    ? `By ${(log.profiles as { full_name: string }).full_name}`
                    : 'System action'}
                </p>
                <p className="text-xs text-gray-400 flex-shrink-0 ml-4">
                  {new Date(log.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              {log.details && (
                <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                  {JSON.stringify(log.details)}
                </p>
              )}
            </div>
          </div>
        ))}

        {(!logs || logs.length === 0) && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <Activity size={32} className="mx-auto mb-3 opacity-30" />
            <p>No activity logged yet</p>
            <p className="text-sm mt-1">Actions will appear here as they happen</p>
          </div>
        )}
      </div>
    </div>
  )
}