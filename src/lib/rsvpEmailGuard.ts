import { createAdminClient } from '@/lib/supabase/admin'

// The RSVP emails are triggered by logged-out guests, so the routes can't
// trust anything the browser sends. They look the guest up by invite token
// and only proceed for a reply recorded moments ago — which also stops the
// endpoints being used to send repeated emails for an old token.
const RECENT_MS = 10 * 60 * 1000

export interface RecentRsvp {
  id: string
  wedding_id: string
  name: string
  email: string | null
  rsvp_status: string
  dietary_restrictions: string | null
  guest_message: string | null
}

export async function getRecentRsvp(token: unknown): Promise<RecentRsvp | null> {
  if (typeof token !== 'string' || !token || token.length > 100) return null

  const supabase = createAdminClient()
  const { data: guest } = await supabase
    .from('guests')
    .select('id, wedding_id, name, email, rsvp_status, dietary_restrictions, guest_message, responded_at')
    .eq('invite_token', token)
    .is('deleted_at', null)
    .single()

  if (!guest?.responded_at) return null
  if (Date.now() - new Date(guest.responded_at).getTime() > RECENT_MS) return null
  return guest
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
