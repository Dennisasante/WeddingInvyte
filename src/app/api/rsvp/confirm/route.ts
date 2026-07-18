import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const RSVP_LABELS: Record<string, string> = {
  yes:        "Yes, I'll be attending.",
  yes_joy:    "I'll be there with joy.",
  no:         "Regretfully, I can't make it.",
  from_afar:  "With love, I'll celebrate from afar.",
}

export async function POST(request: NextRequest) {
  try {
    const { guestName, response, weddingId, token } = await request.json()

    const supabase = await createClient()

    // Get guest email from token
    const { data: guest } = await supabase
      .from('guests')
      .select('email, name')
      .eq('invite_token', token)
      .single()

    if (!guest?.email) {
      return NextResponse.json({ skipped: 'no email' })
    }

    const { data: wedding } = await supabase
      .from('weddings')
      .select('couple_names, event_date, venue_name, primary_color')
      .eq('id', weddingId)
      .single()

    if (!wedding) return NextResponse.json({ skipped: 'no wedding' })

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey || resendKey === 'paste_your_resend_key_here') {
      return NextResponse.json({ skipped: 'no resend key' })
    }

    const resend = new Resend(resendKey)
    const primaryColor = wedding.primary_color || '#D4A373'
    const isAttending = response === 'yes' || response === 'yes_joy'

    await resend.emails.send({
      from: 'Wedding Invite <noreply@dennisasante.com>',
      to: guest.email,
      subject: isAttending
        ? `See you there! Your RSVP is confirmed 💌`
        : `RSVP received — ${wedding.couple_names}`,
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9f6f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:${primaryColor};padding:40px;text-align:center;">
            <p style="color:#fff;font-size:32px;margin:0;">
              ${isAttending ? '🎉' : '💌'}
            </p>
            <h1 style="color:#fff;font-size:24px;margin:12px 0 0;font-family:Arial,sans-serif;">
              ${isAttending ? "We'll see you there!" : "Thank you for letting us know"}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;text-align:center;">
            <p style="color:#666;font-size:16px;margin:0 0 8px;">
              Dear <strong>${guest.name}</strong>,
            </p>
            <p style="color:#666;font-size:15px;line-height:1.6;margin:16px 0;">
              Your RSVP for <strong>${wedding.couple_names}</strong>'s wedding
              has been received.
            </p>
            <div style="background:#faf7f2;border-radius:12px;padding:20px;margin:24px 0;">
              <p style="color:#999;font-size:12px;margin:0 0 6px;
                font-family:Arial,sans-serif;letter-spacing:1px;">YOUR RESPONSE</p>
              <p style="color:#333;font-size:16px;margin:0;font-family:Arial,sans-serif;
                font-weight:600;font-style:italic;">
                "${RSVP_LABELS[response] || response}"
              </p>
            </div>
            ${isAttending && wedding.event_date ? `
            <div style="background:#faf7f2;border-radius:12px;padding:20px;margin:0 0 24px;">
              <p style="color:#999;font-size:12px;margin:0 0 6px;
                font-family:Arial,sans-serif;letter-spacing:1px;">DATE</p>
              <p style="color:#333;font-size:16px;margin:0;font-family:Arial,sans-serif;
                font-weight:600;">
                ${new Date(wedding.event_date).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric',
                  month: 'long', day: 'numeric'
                })}
              </p>
              ${wedding.venue_name ? `
              <p style="color:#999;font-size:12px;margin:16px 0 6px;
                font-family:Arial,sans-serif;letter-spacing:1px;">VENUE</p>
              <p style="color:#333;font-size:16px;margin:0;font-family:Arial,sans-serif;
                font-weight:600;">${wedding.venue_name}</p>
              ` : ''}
            </div>` : ''}
            <p style="color:#aaa;font-size:13px;margin:0;">
              ${isAttending
                ? "We can't wait to celebrate with you!"
                : "We appreciate you letting us know and wish you all the best."}
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#faf7f2;padding:20px 40px;text-align:center;
            border-top:1px solid #f0ebe0;">
            <p style="color:#ccc;font-size:12px;margin:0;font-family:Arial,sans-serif;">
              Made with ❤️ by WeddingInvite
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Confirmation email error:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}