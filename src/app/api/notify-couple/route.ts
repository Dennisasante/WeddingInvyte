import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const RSVP_LABELS: Record<string, string> = {
  yes: "Yes, they'll be attending",
  no: "Regretfully, they can't make it",
}

export async function POST(request: NextRequest) {
  try {
    const { weddingId, guestName, response, dietary, message } = await request.json()

    const supabase = await createClient()

    const { data: wedding } = await supabase
      .from('weddings')
      .select('couple_names, notify_on_rsvp, primary_color')
      .eq('id', weddingId)
      .single()

    if (!wedding || wedding.notify_on_rsvp === false) {
      return NextResponse.json({ skipped: true })
    }

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: admins } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('wedding_id', weddingId)

    if (!admins || admins.length === 0) {
      return NextResponse.json({ skipped: 'no admins found' })
    }

    const { data: authUsers } = await adminSupabase.auth.admin.listUsers()
    const adminIds = new Set(admins.map(a => a.id))
    const recipientEmails = (authUsers?.users || [])
      .filter(u => adminIds.has(u.id) && u.email)
      .map(u => u.email!)

    if (recipientEmails.length === 0) {
      return NextResponse.json({ skipped: 'no emails found' })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey || resendKey === 'paste_your_resend_key_here') {
      return NextResponse.json({ skipped: 'no resend key' })
    }

    const resend = new Resend(resendKey)
    const primaryColor = wedding.primary_color || '#D4A373'
    const isAttending = response === 'yes'

    for (const email of recipientEmails) {
      await resend.emails.send({
        from: 'Wedding Invite <noreply@dennisasante.com>',
        to: email,
        subject: isAttending
          ? `${guestName} just RSVP'd Yes!`
          : `RSVP update from ${guestName}`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9f6f0;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0"
        style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:${primaryColor};padding:32px;text-align:center;">
            <p style="color:#fff;font-size:28px;margin:0;">
              ${isAttending ? '&#127881;' : '&#128203;'}
            </p>
            <h1 style="color:#fff;font-size:20px;margin:10px 0 0;font-family:Arial,sans-serif;">
              New RSVP Response
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;text-align:center;">
            <p style="color:#666;font-size:15px;margin:0 0 20px;">
              <strong style="color:#333;">${guestName}</strong> has responded to your invitation.
            </p>
            <div style="background:#faf7f2;border-radius:12px;padding:18px;margin:0 0 20px;">
              <p style="color:${isAttending ? '#16a34a' : '#ef4444'};font-size:16px;margin:0;font-weight:600;font-family:Arial,sans-serif;">
                ${RSVP_LABELS[response] || response}
              </p>
            </div>
            ${dietary ? `
            <div style="text-align:left;background:#fafafa;border-radius:10px;padding:14px;margin:0 0 14px;">
              <p style="color:#999;font-size:11px;margin:0 0 4px;font-family:Arial,sans-serif;text-transform:uppercase;">Dietary Notes</p>
              <p style="color:#555;font-size:14px;margin:0;">${dietary}</p>
            </div>` : ''}
            ${message ? `
            <div style="text-align:left;background:#fafafa;border-radius:10px;padding:14px;margin:0 0 14px;">
              <p style="color:#999;font-size:11px;margin:0 0 4px;font-family:Arial,sans-serif;text-transform:uppercase;">Message</p>
              <p style="color:#555;font-size:14px;margin:0;font-style:italic;">"${message}"</p>
            </div>` : ''}
            <p style="color:#aaa;font-size:12px;margin:20px 0 0;">
              View all responses in your Wedding Invite dashboard.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#faf7f2;padding:16px 32px;text-align:center;border-top:1px solid #f0ebe0;">
            <p style="color:#ccc;font-size:11px;margin:0;font-family:Arial,sans-serif;">
              Wedding Invite &middot; You can turn off these notifications in Settings
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      })
    }

    return NextResponse.json({ success: true, notified: recipientEmails.length })
  } catch (err) {
    console.error('Notify couple error:', err)
    return NextResponse.json({ error: 'Failed to notify' }, { status: 500 })
  }
}