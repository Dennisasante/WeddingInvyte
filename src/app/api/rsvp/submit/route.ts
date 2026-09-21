import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logActivityServer } from '@/lib/logActivityServer'

const RESPONSES = ['yes', 'yes_joy', 'no', 'from_afar']
const ATTENDING = ['yes', 'yes_joy']

const clip = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : ''

// Records a guest's RSVP. Guests are logged out, so this route (not the
// browser) writes to the database, and only for the guest whose invite
// token was supplied.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = clip(body.token, 100)
    const response = clip(body.response, 20)

    if (!token || !RESPONSES.includes(response)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: guest } = await supabase
      .from('guests')
      .select('id, wedding_id, name, allow_plus_one, partner_id')
      .eq('invite_token', token)
      .is('deleted_at', null)
      .single()
    if (!guest) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: wedding } = await supabase
      .from('weddings')
      .select('is_active, rsvp_deadline')
      .eq('id', guest.wedding_id)
      .single()
    if (!wedding?.is_active) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (wedding.rsvp_deadline && new Date() > new Date(wedding.rsvp_deadline)) {
      return NextResponse.json({ error: 'The RSVP deadline has passed' }, { status: 403 })
    }

    const isAttending = ATTENDING.includes(response)

    // Couples entered as two guests answer for both partners at once.
    let partnerId: string | null = null
    if (guest.partner_id) {
      const { data: partner } = await supabase
        .from('guests')
        .select('id')
        .eq('id', guest.partner_id)
        .is('deleted_at', null)
        .maybeSingle()
      partnerId = partner?.id ?? null
    }
    const attendees = ['both', 'self', 'partner'].includes(body.attendees) ? body.attendees : 'both'
    const myStatus = partnerId && isAttending && attendees === 'partner' ? 'no' : response
    const partnerStatus = partnerId && isAttending && attendees === 'self' ? 'no' : response

    const coupleAttendance = ['mr', 'mrs', 'both'].includes(body.coupleAttendance)
      ? body.coupleAttendance
      : null

    const now = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('guests')
      .update({
        rsvp_status: myStatus,
        dietary_restrictions: clip(body.dietary, 500) || null,
        guest_message: clip(body.message, 2000) || null,
        couple_attendance: partnerId ? null : coupleAttendance,
        invite_status: 'responded',
        responded_at: now,
      })
      .eq('id', guest.id)
    if (updateError) {
      return NextResponse.json({ error: 'Could not save your RSVP' }, { status: 500 })
    }

    if (partnerId) {
      await supabase.rpc('sync_partner_rsvp', { p_token: token, p_status: partnerStatus })
    }

    // The plus one goes straight onto the guest list as their own guest.
    // Sending no name (or not attending) removes one saved earlier.
    if (guest.allow_plus_one) {
      const wantsPlusOne = isAttending && body.wantsPlusOne === true
      const plusOneName = wantsPlusOne ? clip(body.plusOneName, 120) : ''
      if (wantsPlusOne && !plusOneName) {
        return NextResponse.json({ error: "Please enter your plus one's name." }, { status: 400 })
      }
      await supabase.rpc('save_plus_one', {
        p_token: token,
        p_name: plusOneName,
        p_phone: wantsPlusOne ? clip(body.plusOnePhone, 30) : '',
      })
    }

    await logActivityServer({
      weddingId: guest.wedding_id,
      action: 'rsvp_received',
      entityType: 'guest',
      entityId: guest.id,
      details: { guestName: guest.name, response: myStatus },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
