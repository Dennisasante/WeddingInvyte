'use client'
import { useState } from 'react'
import { logActivity } from '@/lib/logActivity'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Plus, Search, Upload, Trash2, Mail,
  Download, UserCheck, Clock, CheckCircle, Printer
} from 'lucide-react'
import AddGuestModal from './AddGuestModal'
import CSVImportModal from './CSVImportModal'

interface Guest {
  id: string
  name: string
  email: string | null
  phone: string | null
  category: string
  rsvp_status: string
  invite_status: string
  allow_plus_one: boolean
  dietary_restrictions: string | null
  notes: string | null
  wedding_id: string
  created_at: string
}

interface Table {
  id: string
  name: string
}

interface Props {
  guests: Guest[]
  weddingId: string
  tables: Table[]
  isSuperAdmin: boolean
}

const RSVP_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  yes: 'bg-green-50 text-green-700',
  yes_joy: 'bg-emerald-50 text-emerald-700',
  no: 'bg-red-50 text-red-600',
  from_afar: 'bg-purple-50 text-purple-700',
}

const RSVP_LABELS: Record<string, string> = {
  pending: 'Pending',
  yes: 'Attending',
  yes_joy: 'With Joy',
  no: 'Not Attending',
  from_afar: 'From Afar',
}

export default function GuestManager({ guests: initialGuests, weddingId, tables, isSuperAdmin }: Props) {
  const [guests, setGuests] = useState(initialGuests)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'yes' | 'no'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCSVModal, setShowCSVModal] = useState(false)
  const supabase = createClient()

  const filtered = guests.filter(g => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.email?.toLowerCase().includes(search.toLowerCase()) ||
      g.phone?.includes(search)
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && g.rsvp_status === 'pending') ||
      (filter === 'yes' && (g.rsvp_status === 'yes' || g.rsvp_status === 'yes_joy')) ||
      (filter === 'no' && (g.rsvp_status === 'no' || g.rsvp_status === 'from_afar'))
    return matchesSearch && matchesFilter
  })

  const handleDelete = async (guestId: string) => {
    if (!confirm('Remove this guest? They will be soft-deleted.')) return

    await supabase
      .from('guests')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', guestId)

    await logActivity({
      weddingId: guests.find(g => g.id === guestId)?.wedding_id,
      action: 'guest_deleted',
      entityType: 'guest',
      entityId: guestId,
    })

    setGuests(prev => prev.filter(g => g.id !== guestId))
  }

  const handleGuestAdded = (newGuest: Guest) => {
    setGuests(prev => [newGuest, ...prev])
    setShowAddModal(false)
  }

  const handleGuestsImported = (newGuests: Guest[]) => {
    setGuests(prev => [...newGuests, ...prev])
    setShowCSVModal(false)
  }

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Category', 'RSVP Status', 'Plus One Allowed', 'Dietary']
    const rows = guests.map(g => [
      g.name,
      g.email || '',
      g.phone || '',
      g.category,
      RSVP_LABELS[g.rsvp_status] || g.rsvp_status,
      g.allow_plus_one ? 'Yes' : 'No',
      g.dietary_restrictions || '',
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guest-list.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.rsvp_status === 'yes' || g.rsvp_status === 'yes_joy').length,
    pending: guests.filter(g => g.rsvp_status === 'pending').length,
    declined: guests.filter(g => g.rsvp_status === 'no' || g.rsvp_status === 'from_afar').length,
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Guest List</h1>
          <p className="text-gray-500 text-sm mt-1">{guests.length} total guests</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 text-sm px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
          >
            <Download size={15} />
            Export
          </button>
          <Link
            href="/dashboard/guests/print"
            target="_blank"
            className="flex items-center gap-2 text-sm px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
          >
            <Printer size={15} />
            Print List
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
          >
            <Printer size={15} />
            Print
          </button>
          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-2 text-sm px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
          >
            <Upload size={15} />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm px-4 py-2.5 rounded-xl transition"
          >
            <Plus size={15} />
            Add Guest
          </button>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: UserCheck, color: 'text-gray-600' },
          { label: 'Attending', value: stats.attending, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600' },
          { label: 'Declined', value: stats.declined, icon: Mail, color: 'text-red-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <Icon size={18} className={color} />
            <div>
              <p className="text-lg font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>
        {(['all', 'pending', 'yes', 'no'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === f
              ? 'bg-amber-100 text-amber-700'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            {f === 'all' ? 'All' : f === 'yes' ? 'Attending' : f === 'no' ? 'Declined' : 'Pending'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left border-b border-gray-100">
              {['Guest', 'Contact', 'Type', 'RSVP', 'Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(guest => (
              <tr key={guest.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">{guest.name}</p>
                  {guest.notes && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-32">{guest.notes}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600">{guest.email || '—'}</p>
                  <p className="text-xs text-gray-400">{guest.phone || ''}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${guest.category === 'couple'
                    ? 'bg-pink-50 text-pink-700'
                    : guest.category === 'plus_one'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-blue-50 text-blue-700'
                    }`}>
                    {guest.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${RSVP_COLORS[guest.rsvp_status] || 'bg-gray-100 text-gray-600'}`}>
                    {RSVP_LABELS[guest.rsvp_status] || guest.rsvp_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {guest.allow_plus_one ? (
                    <span className="text-green-600 text-xs font-medium">✓ Allowed</span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDelete(guest.id)}
                      className="text-gray-300 hover:text-red-500 transition"
                      title="Remove guest"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <UserCheck size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No guests found</p>
            <p className="text-sm mt-1">
              {guests.length === 0
                ? 'Add your first guest to get started'
                : 'Try adjusting your search or filter'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddGuestModal
          weddingId={weddingId}
          onClose={() => setShowAddModal(false)}
          onGuestAdded={handleGuestAdded}
        />
      )}
      {showCSVModal && (
        <CSVImportModal
          weddingId={weddingId}
          onClose={() => setShowCSVModal(false)}
          onImported={handleGuestsImported}
        />
      )}
    </div>
  )
}