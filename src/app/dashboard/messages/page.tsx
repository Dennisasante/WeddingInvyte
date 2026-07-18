import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessageSquare } from 'lucide-react'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.wedding_id) redirect('/dashboard')

  const { data: guests } = await supabase
    .from('guests')
    .select('id, name, guest_message, rsvp_status, responded_at')
    .eq('wedding_id', profile.wedding_id)
    .not('guest_message', 'is', null)
    .neq('guest_message', '')
    .order('responded_at', { ascending: false })

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Guest Messages</h1>
        <p className="text-gray-500 text-sm mt-1">
          {guests?.length || 0} guests left you a message
        </p>
      </div>

      <div className="space-y-4">
        {(guests || []).map(guest => (
          <div
            key={guest.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center text-sm font-bold text-amber-700">
                  {guest.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{guest.name}</p>
                  <p className="text-xs text-gray-400">
                    {guest.responded_at
                      ? new Date(guest.responded_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })
                      : ''}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                guest.rsvp_status === 'yes' || guest.rsvp_status === 'yes_joy'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {guest.rsvp_status === 'yes' ? 'Attending' :
                 guest.rsvp_status === 'yes_joy' ? 'With Joy' :
                 guest.rsvp_status === 'no' ? 'Not Attending' :
                 guest.rsvp_status === 'from_afar' ? 'From Afar' : 'Pending'}
              </span>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <MessageSquare size={14} className="text-amber-400 mb-2" />
              <p className="text-gray-700 text-sm italic leading-relaxed">
                "{guest.guest_message}"
              </p>
            </div>
          </div>
        ))}

        {(!guests || guests.length === 0) && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-1">
              Guest messages will appear here after they RSVP
            </p>
          </div>
        )}
      </div>
    </div>
  )
}