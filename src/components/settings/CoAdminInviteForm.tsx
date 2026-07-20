'use client'
import { useState } from 'react'
import { Send } from 'lucide-react'

export default function CoAdminInviteForm({ weddingId }: { weddingId: string }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/invite-coadmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), weddingId }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to send invite')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
        <p className="text-green-700 font-medium text-sm">
          Invite sent to {email}!
        </p>
        <p className="text-green-500 text-xs mt-1">
          They will receive an email with a link to join your wedding dashboard.
        </p>
        <button
          onClick={() => { setSent(false); setEmail('') }}
          className="text-xs text-green-600 underline mt-2"
        >
          Send another invite
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
      )}
      <div className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="partner@example.com"
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={loading || !email.trim()}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 transition"
        >
          <Send size={15} />
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
      <p className="text-xs text-gray-400">
        Your partner will receive an email with a link to join your wedding.
      </p>
    </div>
  )
}