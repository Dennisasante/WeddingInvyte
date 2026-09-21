import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { acceptCoAdminInvite } from '@/lib/acceptCoAdminInvite'

// Called right after someone signs up or logs in from a co-admin invite link.
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await request.json().catch(() => ({}))
  const result = await acceptCoAdminInvite(user.id, typeof token === 'string' ? token : '')

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
}
