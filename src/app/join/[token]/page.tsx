import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import JoinWedding from '@/components/onboarding/JoinWedding'

export default async function JoinPage({
  params
}: {
  params: { token: string }
}) {
  const supabase = await createClient()

  const { data: invite } = await supabase
    .from('co_admin_invites')
    .select('*, weddings(couple_names, event_date)')
    .eq('token', params.token)
    .eq('status', 'pending')
    .single()

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Invalid or expired invite
          </h1>
          <p className="text-gray-500">
            This invitation link is no longer valid. Please ask your partner to send a new one.
          </p>
        </div>
      </div>
    )
  }

  return <JoinWedding invite={invite} />
}