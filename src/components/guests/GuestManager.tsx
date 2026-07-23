'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Search, Upload, Trash2, Mail,
  Download, UserCheck, Clock, CheckCircle,
  Printer, Edit2, Link
} from 'lucide-react'
import AddGuestModal from './AddGuestModal'
import CSVImportModal from './CSVImportModal'
import EditGuestModal from './EditGuestModal'

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

export default function GuestManager({
  guests: initialGuests,
  weddingId,
  tables,
  isSuperAdmin,
}: Props) {
  const [guests, setGuests] = useState(initialGuests)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'yes' | 'no'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCSVModal, setShowCSVModal] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [bulkDeleting, setBulkDeleting] = useState(false)
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

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([])
    } else {
      setSelected(filtered.map(g => g.id))
    }
  }

  const handleDelete = async (guestId: string) => {
    if (!confirm('Remove this guest?')) return
    await supabase
      .from('guests')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', guestId)
    setGuests(prev => prev.filter(g => g.id !== guestId))
    setSelected(prev => prev.filter(id => id !== guestId))
  }

  const handleBulkDelete = async () => {
    if (!selected.length) return
    if (!confirm(`Delete ${selected.length} guests? This cannot be undone.`)) return
    setBulkDeleting(true)
    await supabase
      .from('guests')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', selected)
    setGuests(prev => prev.filter(g => !selected.includes(g.id)))
    setSelected([])
    setBulkDeleting(false)
  }

  const handleGuestAdded = (newGuest: Guest) => {
    setGuests(prev => [newGuest, ...prev])
    setShowAddModal(false)
  }

  const handleGuestUpdated = (updatedGuest: Guest) => {
    setGuests(prev =>
      prev.map(g => g.id === updatedGuest.id ? updatedGuest : g)
    )
    setEditingGuest(null)
  }

  const handleGuestsImported = (newGuests: Guest[]) => {
    setGuests(prev => [...newGuests, ...prev])
    setShowCSVModal(false)
  }

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Type', 'RSVP', 'Plus One', 'Dietary', 'Notes']
    const rows = guests.map(g => [
      g.name,
      g.email || '',
      g.phone || '',
      g.category,
      RSVP_LABELS[g.rsvp_status] || g.rsvp_status,
      g.allow_plus_one ? 'Yes' : 'No',
      g.dietary_restrictions || '',
      g.notes || '',
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
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Guest List</h1>
          <p className="text-gray-500 text-sm mt-0.5">{guests.length} total guests</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">

          <Link
            href="/dashboard/guests/print"
            target="_blank"
            className="flex items-center gap-2 text-sm px-3 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print</span>
          </Link>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 text-sm px-3 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
          >
            <Upload size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-2 text-sm px-3 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm px-3 py-2 rounded-xl transition"
          >
            <Plus size={14} />
            Add Guest
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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

      {/* Bulk Delete Bar */}
      {
        selected.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
            <p className="text-sm text-red-700 font-medium">
              {selected.length} guest{selected.length !== 1 ? 's' : ''} selected
            </p>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-60"
            >
              <Trash2 size={14} />
              {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        )
      }

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search guests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'pending', 'yes', 'no'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition ${filter === f
                ? 'bg-amber-100 text-amber-700'
                : 'bg-white border border-gray-200 text-gray-600'
                }`}
            >
              {f === 'all' ? 'All' : f === 'yes' ? 'Going' : f === 'no' ? 'Declined' : 'Pending'}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-left border-b border-gray-100">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded accent-amber-500"
                  />
                </th>
                {['Guest', 'Type', 'RSVP', 'Plus One', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(guest => (
                <tr key={guest.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(guest.id)}
                      onChange={() => toggleSelect(guest.id)}
                      className="w-4 h-4 rounded accent-amber-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 text-sm">{guest.name}</p>
                    <p className="text-xs text-gray-400">{guest.email || guest.phone || 'No contact'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${guest.category === 'couple' ? 'bg-pink-50 text-pink-700' :
                      guest.category === 'plus_one' ? 'bg-purple-50 text-purple-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                      {guest.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${RSVP_COLORS[guest.rsvp_status] || 'bg-gray-100 text-gray-600'}`}>
                      {RSVP_LABELS[guest.rsvp_status] || guest.rsvp_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {guest.allow_plus_one
                      ? <span className="text-green-600 text-xs font-medium">Allowed</span>
                      : <span className="text-gray-300 text-xs">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingGuest(guest)}
                        className="text-gray-400 hover:text-amber-600 transition"
                        title="Edit guest"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(guest.id)}
                        className="text-gray-300 hover:text-red-500 transition"
                        title="Remove guest"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <UserCheck size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No guests found</p>
            <p className="text-sm mt-1">
              {guests.length === 0 ? 'Add your first guest to get started' : 'Try adjusting your search'}
            </p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <UserCheck size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No guests found</p>
          </div>
        )}
        {filtered.map(guest => (
          <div key={guest.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selected.includes(guest.id)}
                  onChange={() => toggleSelect(guest.id)}
                  className="w-4 h-4 rounded accent-amber-500 mt-0.5"
                />
                <div>
                  <p className="font-medium text-gray-800">{guest.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {guest.email || guest.phone || 'No contact info'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingGuest(guest)}
                  className="p-2 rounded-lg bg-amber-50 text-amber-600"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(guest.id)}
                  className="p-2 rounded-lg bg-red-50 text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${guest.category === 'couple' ? 'bg-pink-50 text-pink-700' :
                guest.category === 'plus_one' ? 'bg-purple-50 text-purple-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                {guest.category}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RSVP_COLORS[guest.rsvp_status]}`}>
                {RSVP_LABELS[guest.rsvp_status]}
              </span>
              {guest.allow_plus_one && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  +1 allowed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {
        showAddModal && (
          <AddGuestModal
            weddingId={weddingId}
            onClose={() => setShowAddModal(false)}
            onGuestAdded={handleGuestAdded}
          />
        )
      }
      {
        showCSVModal && (
          <CSVImportModal
            weddingId={weddingId}
            onClose={() => setShowCSVModal(false)}
            onImported={handleGuestsImported}
          />
        )
      }
      {
        editingGuest && (
          <EditGuestModal
            guest={editingGuest}
            onClose={() => setEditingGuest(null)}
            onUpdated={handleGuestUpdated}
          />
        )
      }
    </div >
  )
}