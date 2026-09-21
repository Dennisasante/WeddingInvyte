import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { acceptCoAdminInvite } from '@/lib/acceptCoAdminInvite'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const joinToken = searchParams.get('join')

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    if (data.user) {
      // Wait briefly for the profile trigger to fire
      await new Promise(resolve => setTimeout(resolve, 500))

      // Handle co-admin join via Google
      if (joinToken) {
        const joined = await acceptCoAdminInvite(data.user.id, joinToken)
        if (joined.ok) return NextResponse.redirect(`${origin}/dashboard`)
      }

      // Check if user needs onboarding
      const { data: profile } = await supabase
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

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}