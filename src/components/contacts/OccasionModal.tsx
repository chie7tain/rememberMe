'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import type { SpecialOccasion } from '@prisma/client'

interface OccasionModalProps {
  contactId: string
  occasion?: SpecialOccasion
  onClose: () => void
}

export default function OccasionModal({ contactId, occasion, onClose }: OccasionModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    type: occasion?.type ?? 'anniversary',
    label: occasion?.label ?? '',
    date: occasion?.date ? format(new Date(occasion.date), 'yyyy-MM-dd') : '',
    yearKnown: occasion?.yearKnown ?? true,
    recurring: occasion?.recurring ?? true,
    notes: occasion?.notes ?? '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.date) {
      setError('Date is required')
      return
    }

    setLoading(true)

    try {
      const parts = form.date.split('-')
      const year = form.yearKnown ? parseInt(parts[0]) : 1904
      const month = parseInt(parts[1])
      const day = parseInt(parts[2])
      const dateIso = new Date(year, month - 1, day).toISOString()

      const payload = {
        type: form.type,
        label: form.label.trim() || null,
        date: dateIso,
        yearKnown: form.yearKnown,
        recurring: form.recurring,
        notes: form.notes.trim() || null,
      }

      let res: Response
      if (occasion) {
        res = await fetch(`/api/contacts/${contactId}/occasions/${occasion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/contacts/${contactId}/occasions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save occasion')
      }

      router.refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {occasion ? 'Edit Occasion' : 'Add Special Occasion'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
            >
              <option value="anniversary">Anniversary</option>
              <option value="graduation">Graduation</option>
              <option value="work_anniversary">Work Anniversary</option>
              <option value="memorial">Memorial</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              name="label"
              value={form.label}
              onChange={handleChange}
              placeholder="e.g. Wedding Anniversary"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="yearKnown"
                checked={form.yearKnown}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-rose-500"
              />
              Year known
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="recurring"
                checked={form.recurring}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-rose-500"
              />
              Recurring annually
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving...' : occasion ? 'Save Changes' : 'Add Occasion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
