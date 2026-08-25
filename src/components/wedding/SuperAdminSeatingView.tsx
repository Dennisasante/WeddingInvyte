import { Users } from 'lucide-react'

interface Guest {
  id: string
  name: string
  category: string
}

interface SeatingAssignment {
  id: string
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
  coupleNames: string
}

export default function SuperAdminSeatingView({ tables, unassignedGuests, coupleNames }: Props) {
  const getGuestCount = (table: Table) =>
    table.seating_assignments.reduce((sum, a) => sum + (a.guests?.category === 'couple' ? 2 : 1), 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Seating Arrangement</h1>
        <p className="text-gray-500 text-sm mt-1">
          {coupleNames} · {tables.length} table{tables.length !== 1 ? 's' : ''} · read-only
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:sticky md:top-8">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
              <Users size={15} />
              Unassigned
              <span className="ml-auto bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-bold">
                {unassignedGuests.length}
              </span>
            </h3>
            <div className="space-y-2 max-h-[65vh] overflow-y-auto">
              {unassignedGuests.map(guest => (
                <div
                  key={guest.id}
                  className="bg-amber-50 border border-amber-100 rounded-xl p-3"
                >
                  <p className="text-sm font-medium text-gray-800 truncate">{guest.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{guest.category}</p>
                </div>
              ))}
              {unassignedGuests.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">All guests assigned! 🎉</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {tables.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
              <div className="text-4xl mb-3">🪑</div>
              <p className="font-medium">No tables yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map(table => {
                const guestCount = getGuestCount(table)
                const isFull = guestCount >= table.max_seats
                return (
                  <div
                    key={table.id}
                    className={`bg-white rounded-2xl border-2 shadow-sm p-4 ${isFull ? 'border-red-100' : 'border-gray-100'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-800 truncate">{table.name}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isFull ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {guestCount}/{table.max_seats}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {table.seating_assignments.map(assignment => (
                        <div key={assignment.id} className="bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-xs font-medium text-gray-700">{assignment.guests?.name}</p>
                          {assignment.guests?.category === 'couple' && (
                            <p className="text-xs text-gray-400">couple (2 seats)</p>
                          )}
                        </div>
                      ))}
                      {table.seating_assignments.length === 0 && (
                        <div className="border-2 border-dashed rounded-xl py-5 text-center text-xs border-gray-100 text-gray-300">
                          No guests assigned
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
