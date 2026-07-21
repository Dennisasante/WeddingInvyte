import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { token: string }
}): Promise<Metadata> {
  const supabase = await createClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('wedding_id, name')
    .eq('invite_token', params.token)
    .single()

  if (!guest) {
    return {
      title: 'Wedding Invitation — Wedding Invite',
      description: 'You have been invited to a wedding.',
    }
  }

  const { data: wedding } = await supabase
    .from('weddings')
    .select('couple_names, event_date, venue_name, couple_photo_url, cover_photo_url, primary_color')
    .eq('id', guest.wedding_id)
    .single()

  if (!wedding) {
    return {
      title: 'Wedding Invitation — Wedding Invite',
      description: 'You have been invited to a wedding.',
    }
  }

  const date = wedding.event_date
    ? new Date(wedding.event_date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const title = `${guest.name}, you are invited! — ${wedding.couple_names}`

  const descriptionParts = [
    `You are cordially invited to the wedding of ${wedding.couple_names}.`,
    date ? `Join us on ${date}.` : null,
    wedding.venue_name ? `Venue: ${wedding.venue_name}.` : null,
    'Tap to RSVP.',
  ].filter(Boolean)

  const description = descriptionParts.join(' ')

  // Prefer couple photo, then cover photo
  const image = wedding.couple_photo_url || wedding.cover_photo_url || null

  const ogImages = image
    ? [{ url: image, width: 1200, height: 630, alt: `${wedding.couple_names} Wedding` }]
    : []

  return {
    title,
    description,
    openGraph: {
      title: `💍 ${wedding.couple_names} — Wedding Invitation`,
      description,
      images: ogImages,
      type: 'website',
      siteName: 'Wedding Invite',
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: `💍 ${wedding.couple_names} — Wedding Invitation`,
      description,
      images: image ? [image] : [],
    },
  }
}

export default function RSVPTokenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
