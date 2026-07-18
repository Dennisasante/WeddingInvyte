'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, Users, Printer } from 'lucide-react'
import Link from 'next/link'

interface Guest {
  id: string
  name: string
  category: string
}

interface SeatingAssignment {
  id: string
  guest_id: string
  guests: Guest
}

interface Table {
  id: string
  name: string
  max_seats: number
  seating_assignments: SeatingAssignment[]
}

interface Props {
  tables: Table[]
  unassignedGuests: Guest[]
  weddingId: string
}

export default function SeatingManager({
  tables: initialTables,
  unassignedGuests: initialUnassigned,
  weddingId
}: Props) {
  const [tables, setTables] = useState(initialTables)
  const [unassigned, setUnassigned] = useState(initialUnassigned)
  const [draggingGuest, setDraggingGuest] = useState<Guest | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [newTableName, setNewTableName] = useState('')
  const [newTableSeats, setNewTableSeats] = useState(8)
  const [addingTable, setAddingTable] = useState(false)
  const [showAddTable, setShowAddTable] = useState(false)
  const supabase = createClient()

  const getGuestCount = (table: Table) => {
    return table.seating_assignments.reduce((sum, a) => {
      return sum + (a.guests?.category === 'couple' ? 2 : 1)
    }, 0)
  }

  const addTable = async () => {
    if (!newTableName.trim()) return
    setAddingTable(true)

    const { data } = await supabase
      .from('reception_tables')
      .insert({
        wedding_id: weddingId,
        name: newTableName.trim(),
        max_seats: newTableSeats,
      })
      .select()
      .single()

    if (data) {
      setTables(prev => [...prev, { ...data, seating_assignments: [] }])
      setNewTableName('')
      setNewTableSeats(8)
      setShowAddTable(false)
    }
    setAddingTable(false)
  }

  const assignGuest = async (guest: Guest, tableId: string) => {
    const table = tables.find(t => t.id === tableId)
    if (!table) return

    const currentCount = getGuestCount(table)
    const guestSeats = guest.category === 'couple' ? 2 : 1
    if (currentCount + guestSeats > table.max_seats) return

    const { data } = await supabase
      .from('seating_assignments')
      .insert({
        table_id: tableId,
        guest_id: guest.id,
        wedding_id: weddingId,
        seats: guestSeats,
      })
      .select()
      .single()

    if (data) {
      setUnassigned(prev => prev.filter(g => g.id !== guest.id))
      setTables(prev => prev.map(t =>
        t.id === tableId
          ? {
            ...t,
            seating_assignments: [
              ...t.seating_assignments,
              { ...data, guests: guest }
            ]
          }
          : t
      ))
    }
  }

  const removeFromTable = async (
    assignmentId: string,
    tableId: string,
    guest: Guest
  ) => {
    await supabase
      .from('seating_assignments')
      .delete()
      .eq('id', assignmentId)

    setTables(prev => prev.map(t =>
      t.id === tableId
        ? {
          ...t,
          seating_assignments: t.seating_assignments.filter(
            a => a.id !== assignmentId
          )
        }
        : t
    ))
    setUnassigned(prev => [...prev, guest])
  }

  const deleteTable = async (tableId: string) => {
    if (!confirm('Delete this table? Guests will be unassigned.')) return
    const table = tables.find(t => t.id === tableId)
    if (!table) return

    await supabase.from('reception_tables').delete().eq('id', tableId)

    const guestsToUnassign = table.seating_assignments.map(a => a.guests)
    setTables(prev => prev.filter(t => t.id !== tableId))
    setUnassigned(prev => [...prev, ...guestsToUnassign])
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Seating Arrangement</h1>
          <p className="text-gray-500 text-sm mt-1">
            Drag guests from the left onto tables to assign seats
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/tables/print"
            target="_blank"
            className="flex items-center gap-2 text-sm px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
          >
            <Printer size={15} />
            Print Chart
          </Link>
          <button
            onClick={() => setShowAddTable(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm px-4 py-2.5 rounded-xl transition"
          >
            <Plus size={15} />
            Add Table
          </button>
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddTable && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="font-bold text-gray-800 mb-4">Add New Table</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Name
                </label>
                <input
                  value={newTableName}
                  onChange={e => setNewTableName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                  placeholder="e.g. Rose Table, Family Table"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && addTable()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Seats
                </label>
                <input
                  type="number"
                  value={newTableSeats}
                  onChange={e => setNewTableSeats(parseInt(e.target.value) || 8)}
                  min={1}
                  max={30}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddTable(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addTable}
                  disabled={!newTableName.trim() || addingTable}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
                >
                  {addingTable ? 'Adding...' : 'Add Table'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Unassigned Guests */}
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:sticky md:top-8">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
              <Users size={15} />
              Unassigned
              <span className="ml-auto bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold">
                {unassigned.length}
              </span>
            </h3>
            <div className="space-y-2 max-h-[65vh] overflow-y-auto">
              {unassigned.map(guest => (
                <div
                  key={guest.id}
                  draggable
                  onDragStart={() => setDraggingGuest(guest)}
                  onDragEnd={() => setDraggingGuest(null)}
                  className="bg-amber-50 border border-amber-100 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-amber-300 hover:shadow-sm transition select-none"
                >
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {guest.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {guest.category}
                  </p>
                </div>
              ))}
              {unassigned.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">
                  All guests assigned! 🎉
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="flex-1">
          {tables.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">🪑</div>
              <p className="font-medium">No tables yet</p>
              <p className="text-sm mt-1">
                Click "Add Table" to create your first table
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map(table => {
                const guestCount = getGuestCount(table)
                const isFull = guestCount >= table.max_seats
                const isDragTarget = dragOver === table.id

                return (
                  <div
                    key={table.id}
                    onDragOver={e => {
                      e.preventDefault()
                      setDragOver(table.id)
                    }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={() => {
                      setDragOver(null)
                      if (draggingGuest && !isFull) {
                        assignGuest(draggingGuest, table.id)
                        setDraggingGuest(null)
                      }
                    }}
                    className={`bg-white rounded-2xl border-2 shadow-sm p-4 transition ${isDragTarget && !isFull
                      ? 'border-amber-400 bg-amber-50 shadow-md'
                      : isFull
                        ? 'border-red-100'
                        : 'border-gray-100 hover:border-amber-200'
                      }`}
                  >
                    {/* Table Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-800 truncate">
                        {table.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isFull
                          ? 'bg-red-50 text-red-600'
                          : 'bg-green-50 text-green-600'
                          }`}>
                          {guestCount}/{table.max_seats}
                        </span>
                        <button
                          onClick={() => deleteTable(table.id)}
                          className="text-gray-200 hover:text-red-400 transition"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                      <div
                        className={`h-1.5 rounded-full transition-all ${isFull ? 'bg-red-400' : 'bg-amber-400'
                          }`}
                        style={{
                          width: `${Math.min(
                            (guestCount / table.max_seats) * 100,
                            100
                          )}%`
                        }}
                      />
                    </div>

                    {/* Assigned Guests */}
                    <div className="space-y-1.5">
                      {table.seating_assignments.map(assignment => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <div>
                            <p className="text-xs font-medium text-gray-700">
                              {assignment.guests?.name}
                            </p>
                            {assignment.guests?.category === 'couple' && (
                              <p className="text-xs text-gray-400">
                                couple (2 seats)
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromTable(
                              assignment.id,
                              table.id,
                              assignment.guests
                            )}
                            className="text-gray-200 hover:text-red-400 transition ml-2"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      {table.seating_assignments.length === 0 && (
                        <div className={`border-2 border-dashed rounded-xl py-5 text-center text-xs transition ${isDragTarget
                          ? 'border-amber-300 text-amber-500'
                          : 'border-gray-100 text-gray-300'
                          }`}>
                          {isDragTarget ? 'Drop here!' : 'Drag guests here'}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}