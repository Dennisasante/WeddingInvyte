import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import SuperAdminGuestList from '@/components/wedding/SuperAdminGuestList'

export default async function WeddingGuestsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/dashboard')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id, couple_names')
    .eq('id', params.id)
    .single()

  if (!wedding) return notFound()

  const { data: guests } = await supabase
    .from('guests')
    .select('*, seating_assignments(reception_tables(name))')
    .eq('wedding_id', params.id)
    .is('deleted_at', null)
    .order('name')

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link
        href={`/dashboard/weddings/${params.id}`}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition"
      >
        <ArrowLeft size={16} />
        Back to {wedding.couple_names}
      </Link>

      <SuperAdminGuestList guests={guests || []} coupleNames={wedding.couple_names} />
    </div>
  )
}
