'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setError('')

    // Step 1: Create the account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { full_name: form.fullName.trim() },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!signUpData.user) {
      setError('Account creation failed. Please try again.')
      setLoading(false)
      return
    }

    // Step 2: Immediately sign in to establish session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    })

    if (signInError) {
      // Account was created but sign in failed
      // Send them to login with a success message
      setError('Account created! Please sign in to continue.')
      setLoading(false)
      return
    }

    if (!signInData.session) {
      setError('Session could not be established. Please sign in manually.')
      setLoading(false)
      return
    }

    // Step 3: Wait for the profile trigger to fire
    await new Promise(resolve => setTimeout(resolve, 800))

    // Step 4: Check if profile exists, create if not
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, wedding_id, role')
      .eq('id', signInData.user.id)
      .single()

    if (!profile) {
      // Trigger missed — create profile manually
      await supabase.from('profiles').insert({
        id: signInData.user.id,
        role: 'couple_admin',
        full_name: form.fullName.trim(),
        is_primary_admin: true,
      })
    }

    // Step 5: Go to onboarding
    router.push('/onboarding')
    router.refresh()
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">💍</span>
            <span className="font-bold text-gray-800 text-xl">WeddingInvite</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Start planning your perfect wedding
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-amber-100">
          {error && (
            <div className={`text-sm p-3 rounded-xl mb-4 border ${
              error.includes('created')
                ? 'bg-green-50 text-green-700 border-green-100'
                : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {error}
              {error.includes('created') && (
                <Link href="/login" className="block mt-2 font-bold underline">
                  Click here to sign in
                </Link>
              )}
            </div>
          )}

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition mb-4 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.77-2.7.77-2.08 0-3.84-1.4-4.47-3.29H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.51 10.53c-.16-.48-.25-.98-.25-1.53s.09-1.06.25-1.53V5.4H1.83a8 8 0 0 0 0 7.2l2.68-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.47c.63-1.89 2.4-3.29 4.48-3.29z"/>
            </svg>
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or sign up with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                required
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
                placeholder="Emma Johnson"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
                placeholder="emma@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
                placeholder="Minimum 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm"
                placeholder="Repeat your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
