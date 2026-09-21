import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const clip = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : ''

// Lets a guest who has already RSVP'd add, change or remove their plus one
// from the confirmation screen. Keyed on the guest's invite token.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = clip(body.token, 100)
    if (!token) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const supabase = createAdminClient()

    const { data: guest } = await supabase
      .from('guests')
      .select('wedding_id')
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

    const wants = body.wantsPlusOne === true
    const name = wants ? clip(body.plusOneName, 120) : ''
    if (wants && !name) {
      return NextResponse.json({ error: "Please enter your plus one's name." }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('save_plus_one', {
      p_token: token,
      p_name: name,
      p_phone: wants ? clip(body.plusOnePhone, 30) : '',
    })
    if (error || data?.error) {
      return NextResponse.json({ error: 'Could not save that' }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
