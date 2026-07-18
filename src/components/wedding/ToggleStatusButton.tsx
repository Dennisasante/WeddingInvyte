'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ToggleLeft, ToggleRight } from 'lucide-react'

export default function ToggleStatusButton({
  weddingId,
  isActive
}: {
  weddingId: string
  isActive: boolean
}) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('weddings')
      .update({ is_active: !active })
      .eq('id', weddingId)
    setActive(!active)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-60 ${
        active
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-green-50 text-green-600 hover:bg-green-100'
      }`}
    >
      {loading ? (
        'Updating...'
      ) : active ? (
        <><ToggleLeft size={16} /> Deactivate Wedding</>
      ) : (
        <><ToggleRight size={16} /> Activate Wedding</>
      )}
    </button>
  )
}