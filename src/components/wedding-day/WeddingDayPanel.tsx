'use client'
import { useState } from 'react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import {
  Link2, CheckCircle, Download, ExternalLink, Headphones,
  Users, CheckCircle2, AlertCircle,
} from 'lucide-react'

interface Props {
  weddingId: string
  coupleNames: string
  totalGuests: number
  withTable: number
}

export default function WeddingDayPanel({ weddingId, coupleNames, totalGuests, withTable }: Props) {
  const [copied, setCopied] = useState(false)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const venueSeatLink = `${appUrl}/seat/find/${weddingId}`
  const withoutTable = Math.max(totalGuests - withTable, 0)

  const copyLink = async () => {
    await navigator.clipboard.writeText(venueSeatLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQr = () => {
    const svg = document.getElementById('venue-qr-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      const size = 1024
      const padding = 64
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2)
      URL.revokeObjectURL(url)

      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `${coupleNames || 'venue'}-find-my-table-qr.png`.replace(/\s+/g, '-').toLowerCase()
      a.click()
    }
    img.src = url
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Wedding Day</h1>
        <p className="text-gray-500 text-sm mt-1">
          One universal QR code — print it on the entrance banner. Guests scan
          it, search their name or phone number, and see their table.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* QR Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="flex justify-center mb-4 p-4 bg-white rounded-xl border border-gray-100">
            <QRCode id="venue-qr-svg" value={venueSeatLink} size={200} />
          </div>
          <p className="text-xs text-gray-400 break-all mb-4">{venueSeatLink}</p>
          <div className="space-y-2">
            <button
              onClick={downloadQr}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm px-4 py-2.5 rounded-xl transition font-medium"
            >
              <Download size={15} />
              Download QR Code
            </button>
            <button
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 transition"
            >
              {copied ? <CheckCircle size={15} className="text-green-500" /> : <Link2 size={15} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <Users size={16} className="mx-auto text-gray-300 mb-1.5" />
              <p className="text-2xl font-bold text-gray-800">{totalGuests}</p>
              <p className="text-xs text-gray-400 mt-0.5">Total Guests</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <CheckCircle2 size={16} className="mx-auto text-green-400 mb-1.5" />
              <p className="text-2xl font-bold text-gray-800">{withTable}</p>
              <p className="text-xs text-gray-400 mt-0.5">With a Table</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <AlertCircle size={16} className="mx-auto text-amber-400 mb-1.5" />
              <p className="text-2xl font-bold text-gray-800">{withoutTable}</p>
              <p className="text-xs text-gray-400 mt-0.5">Without a Table</p>
            </div>
          </div>

          {withoutTable > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
              {withoutTable} guest{withoutTable !== 1 ? 's' : ''} won't get a table
              result yet — assign them a table on the{' '}
              <Link href="/dashboard/tables" className="underline font-medium">Seating page</Link>{' '}
              before the day.
            </div>
          )}

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            <a
              href={venueSeatLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition"
            >
              <ExternalLink size={17} className="text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Preview Guest Lookup</p>
                <p className="text-xs text-gray-400">
                  Try the exact page guests land on after scanning
                </p>
              </div>
            </a>
            <Link
              href="/dashboard/usher"
              className="flex items-center gap-3 p-4 hover:bg-gray-50 transition"
            >
              <Headphones size={17} className="text-amber-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Usher Mode</p>
                <p className="text-xs text-gray-400">
                  Fast staff lookup by name or phone — for anyone who gets stuck
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
