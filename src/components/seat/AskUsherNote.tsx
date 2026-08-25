'use client'
import { useState } from 'react'
import { Headphones } from 'lucide-react'

export default function AskUsherNote({ prominent = false }: { prominent?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  if (!prominent) {
    return (
      <button
        onClick={() => setExpanded(v => !v)}
        className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition mx-auto mt-6"
      >
        <Headphones size={12} />
        Not sure? Ask an usher for help.
      </button>
    )
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm transition"
      >
        <Headphones size={16} />
        Ask an Usher for Help
      </button>
      {expanded && (
        <p className="text-xs text-gray-400 mt-3">
          Look for anyone wearing an usher badge near the entrance — they can
          look up your table for you right away.
        </p>
      )}
    </div>
  )
}
