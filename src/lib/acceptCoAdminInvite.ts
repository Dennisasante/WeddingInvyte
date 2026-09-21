import { createAdminClient } from '@/lib/supabase/admin'

export type AcceptResult = { ok: true } | { ok: false; error: string }

// Joins a signed-in user to the wedding named on a pending co-admin invite.
//
// This runs on the server because linking a profile to a wedding is what
// grants access to that wedding's data — the browser must not be able to
// point its own profile at an arbitrary wedding. The invite token is the
// proof, and it's checked here (pending, not expired) before anything changes.
export async function acceptCoAdminInvite(userId: string, token: string): Promise<AcceptResult> {
  if (!token || token.length > 100) return { ok: false, error: 'Invalid invite' }

  const supabase = createAdminClient()

  const { data: invite } = await supabase
    .from('co_admin_invites')
    .select('id, wedding_id, expires_at')
    .eq('token', token)
    .eq('status', 'pending')
    .maybeSingle()

  if (!invite) return { ok: false, error: 'This invitation is no longer valid.' }
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { ok: false, error: 'This invitation has expired.' }
  }

  // The profile row is created by a database trigger just after sign-up, so
  // give it a moment if it isn't there yet.
  let linked = false
  for (let attempt = 0; attempt < 4 && !linked; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 500))
    const { data } = await supabase
      .from('profiles')
      .update({ wedding_id: invite.wedding_id, is_primary_admin: false })
      .eq('id', userId)
      .select('id')
    linked = !!data?.length
  }
  if (!linked) return { ok: false, error: 'Your account is not ready yet. Please try again.' }

  await supabase
    .from('co_admin_invites')
    .update({ status: 'accepted' })
    .eq('id', invite.id)
    .eq('status', 'pending')

  return { ok: true }
}
