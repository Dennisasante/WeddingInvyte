import { createClient } from '@/lib/supabase/server'

export async function generateMetadata({
  params
}: {
  params: { token: string }
}) {
  const supabase = await createClient()

  const { data: guest } = await supabase
    .from('guests')
    .select('wedding_id, name')
    .eq('invite_token', params.token)
    .single()

  if (!guest) {
    return { title: 'Wedding Invitation' }
  }

  const { data: wedding } = await supabase
    .from('weddings')
    .select('couple_names, event_date, venue_name, cover_photo_url, couple_photo_url')
    .eq('id', guest.wedding_id)
    .single()

  if (!wedding) {
    return { title: 'Wedding Invitation' }
  }

  const date = wedding.event_date
    ? new Date(wedding.event_date).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      })
    : ''

  const description = [
    `You are invited to the wedding of ${wedding.couple_names}`,
    date ? `on ${date}` : '',
    wedding.venue_name ? `at ${wedding.venue_name}` : '',
  ].filter(Boolean).join(' ')

  const image = wedding.couple_photo_url || wedding.cover_photo_url

  return {
    title: `You're Invited! ${wedding.couple_names}'s Wedding`,
    description,
    openGraph: {
      title: `${wedding.couple_names} — Wedding Invitation 💍`,
      description,
      images: image ? [{ url: image, width: 1200, height: 630 }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${wedding.couple_names} — Wedding Invitation 💍`,
      description,
      images: image ? [image] : [],
    },
  }
}

export default function RSVPLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}