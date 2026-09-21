import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logActivityServer } from '@/lib/logActivityServer'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const clip = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : ''

const digits = (v: string) => v.replace(/\D/g, '')

// The "open" RSVP link is for guests who aren't on the list, so anyone with
// the link can add themselves. That still goes through here (not straight to
// the database) so it's validated, limited, and can't be used to touch
// existing guests other than to correct a repeat submission.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const weddingId = clip(body.weddingId, 50)
    const name = clip(body.name, 120)
    const phone = clip(body.phone, 30)
    const email = clip(body.email, 200)
    const response = clip(body.response, 10)

    if (
      !UUID.test(weddingId) ||
      !name ||
      digits(phone).length < 7 ||
      !['yes', 'no'].includes(response) ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      return NextResponse.json({ error: 'Please check your details and try again.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: wedding } = await supabase
      .from('weddings')
      .select('is_active, rsvp_deadline')
      .eq('id', weddingId)
      .single()
    if (!wedding?.is_active) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (wedding.rsvp_deadline && new Date() > new Date(wedding.rsvp_deadline)) {
      return NextResponse.json({ error: 'The RSVP deadline has passed' }, { status: 403 })
    }

    const record = {
      phone,
      email: email || null,
      rsvp_status: response,
      dietary_restrictions: clip(body.dietary, 500) || null,
      guest_message: clip(body.message, 2000) || null,
      invite_status: 'responded',
      responded_at: new Date().toISOString(),
    }

    // Same name and phone as a guest already on the list -> treat as the
    // same person correcting their answer, not a second guest.
    const { data: sameName } = await supabase
      .from('guests')
      .select('id, phone, invite_token')
      .eq('wedding_id', weddingId)
      .eq('name', name)
      .is('deleted_at', null)
    const existing = (sameName || []).find(
      g => g.phone && digits(g.phone).slice(-9) === digits(phone).slice(-9)
    )

    let guestId: string
    let inviteToken: string
    if (existing) {
      const { error } = await supabase.from('guests').update(record).eq('id', existing.id)
      if (error) return NextResponse.json({ error: 'Could not save your RSVP' }, { status: 500 })
      guestId = existing.id
      inviteToken = existing.invite_token
    } else {
      const { data: created, error } = await supabase
        .from('guests')
        .insert({ wedding_id: weddingId, name, category: 'individual', ...record })
        .select('id, invite_token')
        .single()
      if (error || !created) return NextResponse.json({ error: 'Could not save your RSVP' }, { status: 500 })
      guestId = created.id
      inviteToken = created.invite_token
    }

    await logActivityServer({
      weddingId,
      action: 'rsvp_received',
      entityType: 'guest',
      entityId: guestId,
      details: { guestName: name, response, source: 'open_link' },
    })

    return NextResponse.json({ ok: true, token: inviteToken })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
