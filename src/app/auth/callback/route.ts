import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const joinToken = searchParams.get('join')

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    // Handle co-admin join via Google
    if (joinToken && data.user) {
      const { data: invite } = await supabase
        .from('co_admin_invites')
        .select('*')
        .eq('token', joinToken)
        .eq('status', 'pending')
        .single()

      if (invite) {
        await supabase
          .from('profiles')
          .update({
            wedding_id: invite.wedding_id,
            is_primary_admin: false,
          })
          .eq('id', data.user.id)

        await supabase
          .from('co_admin_invites')
          .update({ status: 'accepted' })
          .eq('id', invite.id)

        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }

    // Check if user needs onboarding
    if (data.user) {
      const supabase2 = await createClient()
      const { data: profile } = await supabase2
        .from('profiles')
        .select('wedding_id, role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'super_admin') {
        return NextResponse.redirect(`${origin}/dashboard`)
      }

      if (!profile?.wedding_id) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}