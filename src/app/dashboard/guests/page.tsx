import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GuestManager from '@/components/guests/GuestManager'

export default async function GuestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const weddingId = profile.wedding_id

  if (!weddingId) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="text-5xl mb-4">💍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No wedding assigned</h2>
          <p className="text-gray-500">Contact your administrator to set up your wedding.</p>
        </div>
      </div>
    )
  }

  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', weddingId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const { data: tables } = await supabase
    .from('reception_tables')
    .select('id, name')
    .eq('wedding_id', weddingId)

  return (
    <GuestManager
      guests={guests || []}
      weddingId={weddingId}
      tables={tables || []}
      isSuperAdmin={profile.role === 'super_admin'}
    />
  )
}