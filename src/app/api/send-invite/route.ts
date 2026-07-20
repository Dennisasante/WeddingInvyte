import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { logActivityServer } from '@/lib/logActivityServer'


export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { guestIds, weddingId } = await request.json()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', weddingId)
    .single()

  if (!wedding) return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })

  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .in('id', guestIds)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resendKey = process.env.RESEND_API_KEY

  if (!resendKey || resendKey === 'paste_your_resend_key_here') {
    return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 })
  }

  const resend = new Resend(resendKey)
  const results: { guestId: string; sent: boolean; error?: string }[] = []

  for (const guest of guests || []) {
    if (!guest.email) {
      results.push({ guestId: guest.id, sent: false, error: 'No email address' })
      continue
    }

    const rsvpLink = `${appUrl}/rsvp/${guest.invite_token}`
    const primaryColor = wedding.primary_color || '#D4A373'
    const weddingDate = wedding.event_date
      ? new Date(wedding.event_date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
      : ''

    const { error } = await resend.emails.send({
      from: 'Wedding Invite <noreply@dennisasante.com>',
      to: guest.email,
      subject: `You're invited! 💍 ${wedding.couple_names}`,
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9f6f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:${primaryColor};padding:48px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0 0 8px;
              letter-spacing:3px;font-family:Arial,sans-serif;">YOU ARE INVITED</p>
            <h1 style="color:#fff;font-size:36px;margin:0;font-family:Georgia,serif;">
              ${wedding.couple_names}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;text-align:center;">
            <h2 style="color:#333;font-size:20px;margin:0 0 8px;font-family:Arial,sans-serif;">
              Dear ${guest.name},
            </h2>
            <p style="color:#666;font-size:15px;line-height:1.6;margin:16px 0 32px;">
              We would be honored by your presence as we celebrate our special day together.
            </p>
            ${weddingDate ? `
            <div style="background:#faf7f2;border-radius:12px;padding:20px;margin:0 0 32px;">
              <p style="color:#999;font-size:12px;margin:0 0 6px;
                font-family:Arial,sans-serif;letter-spacing:1px;">DATE</p>
              <p style="color:#333;font-size:16px;margin:0;
                font-family:Arial,sans-serif;font-weight:600;">${weddingDate}</p>
              ${wedding.venue_name ? `
              <p style="color:#999;font-size:12px;margin:16px 0 6px;
                font-family:Arial,sans-serif;letter-spacing:1px;">VENUE</p>
              <p style="color:#333;font-size:16px;margin:0;
                font-family:Arial,sans-serif;font-weight:600;">${wedding.venue_name}</p>
              ` : ''}
            </div>` : ''}
            <a href="${rsvpLink}"
              style="display:inline-block;background:${primaryColor};color:#fff;
              text-decoration:none;padding:16px 40px;border-radius:50px;
              font-size:16px;font-weight:600;font-family:Arial,sans-serif;">
              RSVP Now 💌
            </a>
            <p style="color:#aaa;font-size:12px;margin:24px 0 0;font-family:Arial,sans-serif;">
              Or visit: ${rsvpLink}
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#faf7f2;padding:20px 40px;text-align:center;
            border-top:1px solid #f0ebe0;">
            <p style="color:#ccc;font-size:12px;margin:0;font-family:Arial,sans-serif;">
              Made with ❤️ by Invyte
            </p>
            <p style="color:#ccc;font-size:11px;margin:8px 0 0;font-family:Arial,sans-serif;">
  You received this because you were invited to a wedding.<br/>
  If this was a mistake, please disregard this email.
</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })

    if (!error) {
      await supabase
        .from('guests')
        .update({ invite_status: 'sent' })
        .eq('id', guest.id)

      await logActivityServer({
        weddingId,
        action: 'invite_sent',
        entityType: 'guest',
        entityId: guest.id,
        details: { guestName: guest.name, email: guest.email },
      })

      results.push({ guestId: guest.id, sent: true })
    } else {
      results.push({ guestId: guest.id, sent: false, error: error.message })
    }
  }

  return NextResponse.json({ results })
}