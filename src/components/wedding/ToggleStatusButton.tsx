'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ToggleStatusButton({
  weddingId,
  isActive
}: {
  weddingId: string
  isActive: boolean
}) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

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

  const handleDelete = async () => {
    const confirmed = confirm(
      'Are you sure you want to delete this wedding? This will also delete all guests, RSVPs, and seating data. This cannot be undone.'
    )
    if (!confirmed) return

    const doubleConfirm = confirm(
      'Final confirmation: delete this wedding and ALL its data permanently?'
    )
    if (!doubleConfirm) return

    setDeleting(true)
    const supabase = createClient()
    await supabase.from('weddings').delete().eq('id', weddingId)
    router.push('/dashboard/weddings')
    router.refresh()
  }

  return (
    <div className="space-y-2">
      <button
        onClick={toggle}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-60 ${
          active
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-green-50 text-green-600 hover:bg-green-100'
        }`}
      >
        {loading ? 'Updating...' : active
          ? <><ToggleLeft size={16} /> Deactivate Wedding</>
          : <><ToggleRight size={16} /> Activate Wedding</>
        }
      </button>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-60"
      >
        <Trash2 size={16} />
        {deleting ? 'Deleting...' : 'Delete Wedding'}
      </button>
    </div>
  )
}