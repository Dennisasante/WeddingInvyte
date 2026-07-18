import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    await supabase.from('activity_log').insert({
      wedding_id: body.weddingId || null,
      actor_id: null,
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