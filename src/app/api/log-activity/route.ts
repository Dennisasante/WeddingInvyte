import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Actor identity comes from the session cookie, never the request body —
    // a client can't spoof who performed the action.
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // activity_log has no INSERT policy for anyone but super_admin, by
    // design (see submit_rsvp/search_guests_by_name for the equivalent
    // anon-write pattern elsewhere in this schema) — every write goes
    // through this trusted server route with the service role instead.
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await adminSupabase.from('activity_log').insert({
      wedding_id: body.weddingId || null,
      actor_id: user?.id || null,
      action: body.action,
      entity_type: body.entityType || null,
      entity_id: body.entityId || null,
      details: body.details || null,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 })
  }
}
