'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  CheckCircle,
  XCircle,
  Users,
  MessageSquare,
  Mail
} from 'lucide-react'

interface Guest {
  id: string
  name: string
  email: string | null
  rsvp_status: string
  dietary_restrictions: string | null
  guest_message: string | null
  responded_at: string | null
  category: string
  couple_attendance: string | null
}

interface PlusOneRequest {
  id: string
  status: string
  requested_at: string
  guests: { name: string; email: string | null } | null
}

interface Props {
  guests: Guest[]
  plusOneRequests: PlusOneRequest[]
  weddingId: string
}

const RSVP_LABELS: Record<string, string> = {
  pending: 'Pending',
  yes: 'Attending',
  yes_joy: 'With Joy',
  no: 'Not Attending',
  from_afar: 'From Afar',
}

const RSVP_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  yes: 'bg-green-50 text-green-700',
  yes_joy: 'bg-emerald-50 text-emerald-700',
  no: 'bg-red-50 text-red-600',
  from_afar: 'bg-purple-50 text-purple-700',
}

export default function RSVPManager({
  guests,
  plusOneRequests: initialRequests,
  weddingId
}: Props) {

  const [plusOneRequests, setPlusOneRequests] = useState(initialRequests)
  const [activeTab, setActiveTab] =
    useState<'responses' | 'plusone'>('responses')

  const [processingId, setProcessingId] =
    useState<string | null>(null)

  const [sendingReminders, setSendingReminders] =
    useState(false)

  const [reminderMsg, setReminderMsg] =
    useState('')

  const supabase = createClient()

  const responded =
    guests.filter(g => g.rsvp_status !== 'pending')

  const attending =
    guests.filter(
      g =>
        g.rsvp_status === 'yes' ||
        g.rsvp_status === 'yes_joy'
    )

  const notAttending =
    guests.filter(
      g =>
        g.rsvp_status === 'no' ||
        g.rsvp_status === 'from_afar'
    )

  const pending =
    guests.filter(g => g.rsvp_status === 'pending')

  const pendingPlusOnes =
    plusOneRequests.filter(
      r => r.status === 'pending'
    )


  const handlePlusOneDecision = async (
    requestId: string,
    action: 'approved' | 'declined'
  ) => {

    setProcessingId(requestId)

    await supabase
      .from('plus_one_requests')
      .update({
        status: action,
        decided_at: new Date().toISOString()
      })
      .eq('id', requestId)


    setPlusOneRequests(prev =>
      prev.map(r =>
        r.id === requestId
          ? { ...r, status: action }
          : r
      )
    )

    setProcessingId(null)
  }


  const sendReminders = async () => {

    setSendingReminders(true)
    setReminderMsg('')

    const res = await fetch('/api/send-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        weddingId
      }),
    })

    const data = await res.json()

    setReminderMsg(
      data.sent > 0
        ? `✅ Sent reminders to ${data.sent} guests`
        : data.message || 'No pending guests to remind'
    )

    setSendingReminders(false)
  }


  const tabs = [
    {
      key: 'responses',
      label: 'RSVP Responses',
      count: responded.length
    },
    {
      key: 'plusone',
      label: 'Plus One Requests',
      count: pendingPlusOnes.length
    },
  ] as const


  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-6">

        <div className="flex items-start justify-between flex-wrap gap-3">

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              RSVP Manager
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              {responded.length} of {guests.length} guests have responded
            </p>
          </div>


          <button
            onClick={sendReminders}
            disabled={
              sendingReminders ||
              pending.length === 0
            }
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
          >

            <Mail size={15} />

            {sendingReminders
              ? 'Sending...'
              : `Send Reminders (${pending.length})`
            }

          </button>

        </div>


        {reminderMsg && (
          <div className="mt-3 p-3 bg-green-50 text-green-700 rounded-xl text-sm">
            {reminderMsg}
          </div>
        )}

      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total',
            value: guests.length,
            color: 'text-gray-600',
            bg: 'bg-gray-50'
          },
          {
            label: 'Attending',
            value: attending.length,
            color: 'text-green-600',
            bg: 'bg-green-50'
          },
          {
            label: 'Not Attending',
            value: notAttending.length,
            color: 'text-red-500',
            bg: 'bg-red-50'
          },
          {
            label: 'Pending',
            value: pending.length,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
          },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className={`${bg} rounded-2xl p-4 border border-white`}
          >
            <p className={`text-2xl font-bold ${color}`}>
              {value}
            </p>

            <p className="text-xs text-gray-500 mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>


      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === tab.key
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label}

            {tab.count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.key
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-gray-200 text-gray-600'
                  }`}
              >
                {tab.count}
              </span>
            )}

          </button>
        ))}
      </div>


      {/* RSVP Responses Tab */}
      {activeTab === 'responses' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">

              

            </table>
          </div>
                </div>
      )}

      {guests.length === 0 && (
        <div className="text-center py-12 text-gray-400">

          <Users
            size={32}
            className="mx-auto mb-3 opacity-30"
          />
          <p>
            No guests yet
          </p>
        </div>
      )}



      {/* Plus One Requests Tab */}
      {
        activeTab === 'plusone' && (

          <div className="space-y-3">


            {plusOneRequests.length === 0 && (

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">

                <Users
                  size={32}
                  className="mx-auto mb-3 opacity-30"
                />

                <p>
                  No plus one requests yet
                </p>

              </div>

            )}



            {plusOneRequests.map(request => (

              <div
                key={request.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between"
              >

                <div>

                  <p className="font-medium text-gray-800">
                    {request.guests?.name}
                  </p>

                  <p className="text-sm text-gray-400">
                    {request.guests?.email || 'No email'}
                  </p>


                  <p className="text-xs text-gray-400 mt-1">

                    Requested{' '}

                    {new Date(
                      request.requested_at
                    ).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }
                    )}

                  </p>

                </div>



                <div className="flex items-center gap-3">

                  {request.status === 'pending' ? (

                    <>

                      <button
                        onClick={() =>
                          handlePlusOneDecision(
                            request.id,
                            'declined'
                          )
                        }
                        disabled={
                          processingId === request.id
                        }
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                      >

                        <XCircle size={15} />

                        Decline

                      </button>



                      <button
                        onClick={() =>
                          handlePlusOneDecision(
                            request.id,
                            'approved'
                          )
                        }
                        disabled={
                          processingId === request.id
                        }
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition disabled:opacity-50"
                      >

                        <CheckCircle size={15} />

                        Approve

                      </button>

                    </>


                  ) : (

                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${request.status === 'approved'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-600'
                        }`}
                    >

                      {request.status === 'approved'
                        ? '✓ Approved'
                        : '✗ Declined'
                      }

                    </span>

                  )}

                </div>

              </div>

            ))}

          </div>

        )
      }

    </div >
  )
}

