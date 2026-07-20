import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, weddingId } = await request.json()

  const { data: wedding } = await supabase
    .from('weddings')
    .select('couple_names')
    .eq('id', weddingId)
    .single()

  if (!wedding) return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })

  const { data: invite, error } = await supabase
    .from('co_admin_invites')
    .insert({
      wedding_id: weddingId,
      invited_by: user.id,
      email: email.trim(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteLink = `${appUrl}/join/${invite.token}`

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey && resendKey !== 'paste_your_resend_key_here') {
    const resend = new Resend(resendKey)
    await resend.emails.send({
      from: 'WeddingInvite <noreply@dennisasante.com>',
      to: email.trim(),
      subject: `You've been invited to co-manage ${wedding.couple_names}'s wedding 💍`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;">
          <div style="text-align:center;margin-bottom:32px;">
            <span style="font-size:40px;">💍</span>
            <h1 style="color:#1B2A4A;margin:16px 0 8px;">You're invited!</h1>
            <p style="color:#6b7280;">You've been invited to help manage</p>
            <p style="color:#D4A373;font-weight:bold;font-size:18px;">${wedding.couple_names}'s Wedding</p>
          </div>
          <p style="color:#374151;line-height:1.6;">
            Click the button below to accept the invitation and get access to the wedding dashboard.
            You'll be able to manage guests, RSVPs, seating and more.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${inviteLink}"
              style="display:inline-block;background:#D4A373;color:#fff;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:bold;font-size:16px;">
              Accept Invitation
            </a>
          </div>
          <p style="color:#9ca3af;font-size:12px;text-align:center;">
            This invitation expires in 7 days.<br/>
            If you weren't expecting this, you can ignore this email.
          </p>
        </div>
      `,
    })
  }

  return NextResponse.json({ success: true, inviteLink })
}