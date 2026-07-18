'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Upload, CheckCircle } from 'lucide-react'
import Papa from 'papaparse'

interface Props {
  weddingId: string
  onClose: () => void
  onImported: (guests: any[]) => void
}

export default function CSVImportModal({ weddingId, onClose, onImported }: Props) {
  const [preview, setPreview] = useState<{ name: string; email: string; phone: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[]
        const mapped = rows.map(row => ({
          name: row.name || row.Name || row.full_name || row['Full Name'] || '',
          email: row.email || row.Email || '',
          phone: row.phone || row.Phone || '',
        })).filter(r => r.name.trim())

        if (mapped.length === 0) {
          setError('No valid guests found. Make sure your CSV has a "name" column.')
          return
        }
        setPreview(mapped)
      },
      error: () => setError('Failed to read the CSV file. Please check the format.')
    })
  }

  const handleImport = async () => {
    if (!preview.length) return
    setLoading(true)
    setError('')

    const guests = preview.map(p => ({
      wedding_id: weddingId,
      name: p.name.trim(),
      email: p.email.trim() || null,
      phone: p.phone.trim() || null,
      category: 'individual',
    }))

    const { data, error } = await supabase
      .from('guests')
      .insert(guests)
      .select()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onImported(data || [])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Import Guests from CSV</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 text-blue-800 text-sm p-3 rounded-xl border border-blue-100">
            <p className="font-medium mb-1">CSV Format Required</p>
            <p>Your CSV must have a <strong>name</strong> column. Optional columns: <strong>email</strong>, <strong>phone</strong></p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {preview.length === 0 ? (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 hover:bg-amber-50 transition">
              <Upload size={28} className="text-gray-300 mb-2" />
              <span className="text-sm font-medium text-gray-500">Click to upload CSV file</span>
              <span className="text-xs text-gray-400 mt-1">or drag and drop</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
            </label>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={16} className="text-green-500" />
                <p className="text-sm font-medium text-gray-700">
                  {preview.length} guests ready to import
                </p>
              </div>
              <div className="max-h-52 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                {preview.slice(0, 20).map((g, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{g.name}</span>
                    <span className="text-xs text-gray-400">{g.email || 'no email'}</span>
                  </div>
                ))}
                {preview.length > 20 && (
                  <div className="px-4 py-2 text-xs text-gray-400 text-center">
                    ...and {preview.length - 20} more
                  </div>
                )}
              </div>
              <button
                onClick={() => setPreview([])}
                className="text-xs text-gray-400 hover:text-gray-600 mt-2 underline"
              >
                Choose different file
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!preview.length || loading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? 'Importing...' : `Import ${preview.length} Guests`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}