'use client'
import { useState } from 'react'
import { KeyRound, X, Check } from 'lucide-react'

interface Props {
  userId: string
  userName: string
}

export default function ResetPasswordButton({ userId, userName }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError('')

    const response = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newPassword }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Failed to reset password')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => {
      setShowModal(false)
      setSuccess(false)
      setNewPassword('')
    }, 2000)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-xs text-gray-400 hover:text-amber-600 transition flex items-center gap-1"
        title="Reset password"
      >
        <KeyRound size={13} />
        Reset
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Reset Password</h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setNewPassword('')
                  setError('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Set a new password for <strong>{userName}</strong>
            </p>

            {error && (
              <div className="mb-3 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success ? (
              <div className="flex items-center justify-center gap-2 py-4 text-green-600">
                <Check size={20} />
                <span className="font-medium">Password reset successfully!</span>
              </div>
            ) : (
              <>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password (min 8 characters)"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setNewPassword('')
                      setError('')
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={loading || !newPassword}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}