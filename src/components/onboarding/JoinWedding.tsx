'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'

interface Invite {
  id: string
  token: string
  wedding_id: string
  email: string
  weddings: {
    couple_names: string
    event_date: string | null
  } | null
}

export default function JoinWedding({ invite }: { invite: Invite }) {
  const [mode, setMode] = useState<'choice' | 'login' | 'signup'>('choice')
  const [form, setForm] = useState({ fullName: '', email: invite.email, password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const weddingDate = invite.weddings?.event_date
    ? new Date(invite.weddings.event_date).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      })
    : null

  const acceptInvite = async (userId: string) => {
    await supabase
      .from('profiles')
      .update({
        wedding_id: invite.wedding_id,
        is_primary_admin: false,
      })
      .eq('id', userId)

    await supabase
      .from('co_admin_invites')
      .update({ status: 'accepted' })
      .eq('id', invite.id)

    router.push('/dashboard')
  }

  const handleGoogleJoin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?join=${invite.token}`,
      },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName } },
    })

    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) await acceptInvite(data.user.id)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) await acceptInvite(data.user.id)
  }

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">💍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            You're invited!
          </h1>
          <p className="text-gray-500">
            Join as co-admin for
          </p>
          <p className="font-bold text-amber-600 text-lg">
            {invite.weddings?.couple_names}
          </p>
          {weddingDate && (
            <p className="text-gray-400 text-sm mt-1">{weddingDate}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-amber-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          {mode === 'choice' && (
            <div className="space-y-3">
              <button
                onClick={handleGoogleJoin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.77-2.7.77-2.08 0-3.84-1.4-4.47-3.29H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.51 10.53c-.16-.48-.25-.98-.25-1.53s.09-1.06.25-1.53V5.4H1.83a8 8 0 0 0 0 7.2l2.68-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.47c.63-1.89 2.4-3.29 4.48-3.29z"/>
                </svg>
                Continue with Google
              </button>
              <button
                onClick={() => setMode('signup')}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition"
              >
                Create New Account
              </button>
              <button
                onClick={() => setMode('login')}
                className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition"
              >
                I already have an account
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <h2 className="font-bold text-gray-800 mb-4">Create your account</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  className={inputClass} placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={inputClass} placeholder="Minimum 8 characters" minLength={8} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-60">
                {loading ? 'Joining...' : 'Join Wedding'}
              </button>
              <button type="button" onClick={() => setMode('choice')}
                className="w-full text-sm text-gray-400 hover:text-gray-600">
                Back
              </button>
            </form>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h2 className="font-bold text-gray-800 mb-4">Sign in to accept invite</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={inputClass} placeholder="Your password" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-60">
                {loading ? 'Joining...' : 'Sign In & Join'}
              </button>
              <button type="button" onClick={() => setMode('choice')}
                className="w-full text-sm text-gray-400 hover:text-gray-600">
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}