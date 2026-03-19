'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Contact, SpecialOccasion, CheckIn } from '@prisma/client'
import ContactAvatar from './ContactAvatar'
import LogCheckinModal from './LogCheckinModal'
import OccasionModal from './OccasionModal'
import {
  getRelationshipColor,
  formatTimeAgo,
  formatFullDate,
  formatShortDate,
  getDaysUntil,
  getOccasionIcon,
  getMethodIcon,
  isOverdue,
  getDaysOverdue,
} from '@/lib/utils'
import {
  ChevronLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Calendar,
  Clock,
} from 'lucide-react'

type ContactWithRelations = Contact & {
  occasions: SpecialOccasion[]
  checkins: CheckIn[]
}

interface Props {
  contact: ContactWithRelations
}

export default function ContactDetailClient({ contact }: Props) {
  const router = useRouter()
  const [showCheckinModal, setShowCheckinModal] = useState(false)
  const [showOccasionModal, setShowOccasionModal] = useState(false)
  const [editingOccasion, setEditingOccasion] = useState<SpecialOccasion | null>(null)
  const [deletingContact, setDeletingContact] = useState(false)

  const lastCheckin = contact.checkins[0] ?? null
  const overdue = isOverdue(contact.checkInFrequency, lastCheckin?.contactedAt ?? null)
  const daysOverdue = getDaysOverdue(contact.checkInFrequency, lastCheckin?.contactedAt ?? null)

  async function handleDeleteContact() {
    if (!confirm(`Are you sure you want to delete ${contact.name}? This cannot be undone.`)) return
    setDeletingContact(true)
    try {
      await fetch(`/api/contacts/${contact.id}`, { method: 'DELETE' })
      router.push('/contacts')
      router.refresh()
    } catch {
      setDeletingContact(false)
    }
  }

  async function handleDeleteOccasion(occasionId: string) {
    if (!confirm('Delete this occasion?')) return
    await fetch(`/api/contacts/${contact.id}/occasions/${occasionId}`, { method: 'DELETE' })
    router.refresh()
  }

  const preferredContactIcon =
    contact.preferredContact === 'call' ? (
      <Phone className="w-4 h-4" />
    ) : contact.preferredContact === 'email' ? (
      <Mail className="w-4 h-4" />
    ) : (
      <MessageSquare className="w-4 h-4" />
    )

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/contacts"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Contacts
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">{contact.name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <ContactAvatar name={contact.name} photoUrl={contact.photoUrl} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
              {contact.nickname && (
                <p className="text-gray-500 mt-0.5">&ldquo;{contact.nickname}&rdquo;</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRelationshipColor(
                    contact.relationshipType
                  )}`}
                >
                  {contact.relationshipType}
                </span>
                <span className="text-xs text-gray-500">
                  Check in: {contact.checkInFrequency}
                </span>
              </div>

              {overdue && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {daysOverdue >= 999
                    ? 'Never contacted — overdue!'
                    : `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCheckinModal(true)}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Log Check-in
            </button>
            <Link
              href={`/contacts/${contact.id}/edit`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={handleDeleteContact}
              disabled={deletingContact}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <a href={`tel:${contact.phone}`} className="hover:text-rose-500 transition-colors">
                {contact.phone}
              </a>
            </div>
          )}
          {contact.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              <a
                href={`mailto:${contact.email}`}
                className="hover:text-rose-500 transition-colors truncate"
              >
                {contact.email}
              </a>
            </div>
          )}
          {contact.birthday && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-base">🎂</span>
              <span>
                {contact.birthdayYearKnown
                  ? formatFullDate(new Date(contact.birthday))
                  : formatShortDate(new Date(contact.birthday))}
                {' — '}
                <span className="text-rose-600 font-medium">
                  {getDaysUntil(new Date(contact.birthday)) === 0
                    ? 'Today!'
                    : `in ${getDaysUntil(new Date(contact.birthday))} days`}
                </span>
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {preferredContactIcon}
            <span>Prefers {contact.preferredContact}</span>
          </div>
        </div>

        {contact.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{contact.notes}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Special Occasions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Special Occasions</h2>
            <button
              onClick={() => {
                setEditingOccasion(null)
                setShowOccasionModal(true)
              }}
              className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {contact.occasions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No special occasions yet</p>
          ) : (
            <div className="space-y-3">
              {contact.occasions.map((occasion) => {
                const daysUntil = getDaysUntil(new Date(occasion.date))
                return (
                  <div
                    key={occasion.id}
                    className="flex items-start justify-between group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getOccasionIcon(occasion.type)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {occasion.label || occasion.type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {occasion.yearKnown
                            ? formatFullDate(new Date(occasion.date))
                            : formatShortDate(new Date(occasion.date))}
                          {occasion.recurring && (
                            <span className="text-rose-600 ml-2 font-medium">
                              in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingOccasion(occasion)
                          setShowOccasionModal(true)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOccasion(occasion.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Check-in History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Check-in History</h2>
            <button
              onClick={() => setShowCheckinModal(true)}
              className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Log
            </button>
          </div>

          {contact.checkins.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No check-ins logged yet</p>
          ) : (
            <div className="space-y-3">
              {contact.checkins.slice(0, 10).map((checkin) => (
                <div key={checkin.id} className="flex items-start gap-3">
                  <span className="text-lg">{getMethodIcon(checkin.method)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {checkin.method.replace('_', ' ')}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatTimeAgo(new Date(checkin.contactedAt))}
                      </span>
                    </div>
                    {checkin.notes && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{checkin.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCheckinModal && (
        <LogCheckinModal
          contactId={contact.id}
          contactName={contact.nickname || contact.name}
          onClose={() => setShowCheckinModal(false)}
        />
      )}

      {showOccasionModal && (
        <OccasionModal
          contactId={contact.id}
          occasion={editingOccasion ?? undefined}
          onClose={() => {
            setShowOccasionModal(false)
            setEditingOccasion(null)
          }}
        />
      )}
    </div>
  )
}
