import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Plus, CheckCircle, XCircle } from 'lucide-react'
import ResetPasswordButton from '@/components/admins/ResetPasswordButton'
import CreateSuperAdminButton from '@/components/admins/CreateSuperAdminButton'

export default async function AdminsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/dashboard')

  // Use admin client to get emails from auth.users
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: admins } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'couple_admin')
    .order('created_at', { ascending: false })

  // Get emails for all admins
  const { data: authUsers } = await adminSupabase.auth.admin.listUsers()
  const emailMap = Object.fromEntries(
    (authUsers?.users || []).map(u => [u.id, u.email])
  )

  const { data: weddings } = await supabase
    .from('weddings')
    .select('id, couple_names, is_active')

  const weddingMap = Object.fromEntries(
    (weddings || []).map(w => [w.id, w])
  )

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Couple Admins</h1>
          <p className="text-gray-500 text-sm mt-1">
            {admins?.length || 0} accounts registered
          </p>
        </div>
        <Link
          href="/dashboard/weddings/new"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          <Plus size={16} />
          New Wedding & Admin
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left border-b border-gray-100">
              {['Admin', 'Email', 'Wedding', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(admins || []).map(admin => {
              const wedding = admin.wedding_id ? weddingMap[admin.wedding_id] : null
              const email = emailMap[admin.id] || '—'
              return (
                <tr key={admin.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-sm font-bold text-amber-700">
                        {admin.full_name?.charAt(0) || '?'}
                      </div>
                      <p className="font-medium text-gray-800">
                        {admin.full_name || 'No name'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {wedding ? wedding.couple_names : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {wedding?.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                        <CheckCircle size={10} />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        <XCircle size={10} />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {wedding && (
                        <Link
                          href={`/dashboard/weddings/${wedding.id}`}
                          className="text-xs text-amber-600 hover:underline font-medium"
                        >
                          View →
                        </Link>
                      )}
                      <ResetPasswordButton
                        userId={admin.id}
                        userName={admin.full_name || email}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <CreateSuperAdminButton />
                      <Link
                        href="/dashboard/weddings/new"
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
                      >
                        <Plus size={16} />
                        New Wedding & Admin
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {(!admins || admins.length === 0) && (
          <div className="text-center py-12 text-gray-400">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p>No couple admins yet</p>
          </div>
        )}
      </div>
    </div>
  )
}