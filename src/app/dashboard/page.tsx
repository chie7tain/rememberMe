import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ContactAvatar from '@/components/contacts/ContactAvatar'
import QuickCheckinButton from '@/components/dashboard/QuickCheckinButton'
import {
  getDaysUntil,
  isOverdue,
  getDaysOverdue,
  getRelationshipColor,
  formatShortDate,
  getOccasionIcon,
  formatTimeAgo,
} from '@/lib/utils'
import { Calendar, Clock, Star, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [contacts, occasions] = await Promise.all([
    prisma.contact.findMany({
      include: {
        checkins: {
          orderBy: { contactedAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.specialOccasion.findMany({
      where: { recurring: true },
      include: { contact: true },
    }),
  ])

  // Upcoming birthdays (30 days)
  const upcomingBirthdays = contacts
    .filter((c) => c.birthday !== null)
    .map((c) => ({ ...c, daysUntil: getDaysUntil(new Date(c.birthday!)) }))
    .filter((c) => c.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  // Overdue check-ins
  const overdueCheckins = contacts
    .map((c) => {
      const lastCheckin = c.checkins[0] ?? null
      const lastCheckedIn = lastCheckin ? new Date(lastCheckin.contactedAt) : null
      return {
        ...c,
        lastCheckedIn,
        daysOverdue: getDaysOverdue(c.checkInFrequency, lastCheckedIn),
      }
    })
    .filter((c) => isOverdue(c.checkInFrequency, c.lastCheckedIn))
    .sort((a, b) => b.daysOverdue - a.daysOverdue)

  // Upcoming special occasions (30 days, non-birthday)
  const upcomingOccasions = occasions
    .filter((o) => o.type !== 'birthday')
    .map((o) => ({ ...o, daysUntil: getDaysUntil(new Date(o.date)) }))
    .filter((o) => o.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  const totalContacts = contacts.length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Stay connected with the people who matter to you.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalContacts}</p>
              <p className="text-xs text-gray-500">Total Contacts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overdueCheckins.length}</p>
              <p className="text-xs text-gray-500">Overdue Check-ins</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingBirthdays.length}</p>
              <p className="text-xs text-gray-500">Birthdays This Month</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Birthdays */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎂</span>
            <h2 className="font-semibold text-gray-900">Upcoming Birthdays</h2>
            <span className="text-xs text-gray-400 ml-auto">Next 30 days</span>
          </div>

          {upcomingBirthdays.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No birthdays in the next 30 days
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingBirthdays.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/contacts/${contact.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <ContactAvatar name={contact.name} photoUrl={contact.photoUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-rose-600 transition-colors">
                      {contact.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatShortDate(new Date(contact.birthday!))}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {contact.daysUntil === 0 ? (
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        Today! 🎉
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        in{' '}
                        <span className="font-semibold text-rose-600">{contact.daysUntil}</span>{' '}
                        days
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Overdue Check-ins */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Overdue Check-ins</h2>
          </div>

          {overdueCheckins.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              You&apos;re all caught up! Great job staying in touch.
            </p>
          ) : (
            <div className="space-y-3">
              {overdueCheckins.slice(0, 8).map((contact) => (
                <div key={contact.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Link href={`/contacts/${contact.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <ContactAvatar name={contact.name} photoUrl={contact.photoUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                      <p className="text-xs text-gray-500">
                        {contact.lastCheckedIn
                          ? `Last: ${formatTimeAgo(contact.lastCheckedIn)}`
                          : 'Never contacted'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRelationshipColor(
                          contact.relationshipType
                        )}`}
                      >
                        {contact.relationshipType}
                      </span>
                    </div>
                  </Link>
                  <QuickCheckinButton
                    contactId={contact.id}
                    contactName={contact.nickname || contact.name}
                  />
                </div>
              ))}
              {overdueCheckins.length > 8 && (
                <Link
                  href="/contacts"
                  className="block text-center text-sm text-rose-600 hover:text-rose-700 font-medium pt-2"
                >
                  View all {overdueCheckins.length} overdue contacts
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Special Occasions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold text-gray-900">Upcoming Special Occasions</h2>
            <span className="text-xs text-gray-400 ml-auto">Next 30 days</span>
          </div>

          {upcomingOccasions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No special occasions in the next 30 days
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {upcomingOccasions.map((occasion) => (
                <Link
                  key={occasion.id}
                  href={`/contacts/${occasion.contactId}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-xl">{getOccasionIcon(occasion.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-rose-600 transition-colors">
                      {occasion.label || occasion.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">{occasion.contact.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {occasion.daysUntil === 0 ? (
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                        Today!
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        in{' '}
                        <span className="font-semibold text-purple-600">{occasion.daysUntil}</span>{' '}
                        days
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
