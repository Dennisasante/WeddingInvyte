import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weddingId } = await request.json()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', weddingId)
    .single()

  if (!wedding) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get guests who haven't responded yet and have an email
  const { data: pendingGuests } = await supabase
    .from('guests')
    .select('*')
    .eq('wedding_id', weddingId)
    .eq('rsvp_status', 'pending')
    .not('email', 'is', null)
    .is('deleted_at', null)

  if (!pendingGuests?.length) {
    return NextResponse.json({ sent: 0, message: 'No pending guests with email' })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey || resendKey === 'paste_your_resend_key_here') {
    return NextResponse.json({ error: 'Email not configured' }, { status: 500 })
  }

  const resend = new Resend(resendKey)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const primaryColor = wedding.primary_color || '#D4A373'
  let sentCount = 0

  for (const guest of pendingGuests) {
    if (!guest.email) continue

    const rsvpLink = `${appUrl}/rsvp/${guest.invite_token}`
    const deadline = wedding.rsvp_deadline
      ? new Date(wedding.rsvp_deadline).toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        })
      : null

    const { error } = await resend.emails.send({
      from: 'Wedding Invite <noreply@dennisasante.com>',
      to: guest.email,
      subject: `Just a reminder — ${wedding.couple_names} would love to hear from you 💌`,
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9f6f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:16px;overflow:hidden;
        box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:${primaryColor};padding:40px;text-align:center;">
            <h1 style="color:#fff;font-size:24px;margin:0;font-family:Arial,sans-serif;">
              A gentle reminder 💌
            </h1>
            <p style="color:rgba(255,255,255,0.85);font-size:16px;margin:10px 0 0;">
              ${wedding.couple_names}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;text-align:center;">
            <p style="color:#666;font-size:16px;line-height:1.6;margin:0 0 24px;">
              Dear <strong>${guest.name}</strong>, we noticed you haven't
              responded to our wedding invitation yet. We would love to know
              if you can make it!
            </p>
            ${deadline ? `
            <div style="background:#fef3cd;border-radius:12px;padding:16px;margin:0 0 24px;">
              <p style="color:#856404;font-size:14px;margin:0;font-family:Arial,sans-serif;">
                ⏰ RSVP deadline: <strong>${deadline}</strong>
              </p>
            </div>` : ''}
            <a href="${rsvpLink}"
              style="display:inline-block;background:${primaryColor};color:#fff;
              text-decoration:none;padding:16px 40px;border-radius:50px;
              font-size:16px;font-weight:600;font-family:Arial,sans-serif;">
              RSVP Now 💌
            </a>
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

    if (!error) sentCount++
  }

  return NextResponse.json({ sent: sentCount, total: pendingGuests.length })
}