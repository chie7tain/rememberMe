import Link from 'next/link'
import type { Contact, CheckIn } from '@prisma/client'
import ContactAvatar from './ContactAvatar'
import { getRelationshipColor, formatTimeAgo, getDaysUntil, formatShortDate } from '@/lib/utils'
import { Phone, Mail, MessageSquare } from 'lucide-react'

interface ContactCardProps {
  contact: Contact & { checkins: CheckIn[] }
}

const preferredContactIcons: Record<string, React.ReactNode> = {
  call: <Phone className="w-3 h-3" />,
  email: <Mail className="w-3 h-3" />,
  text: <MessageSquare className="w-3 h-3" />,
}

export default function ContactCard({ contact }: ContactCardProps) {
  const lastCheckin = contact.checkins[0] ?? null
  const hasBirthday = contact.birthday !== null
  const daysUntilBirthday = hasBirthday ? getDaysUntil(contact.birthday as Date) : null

  return (
    <Link href={`/contacts/${contact.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-rose-300 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start gap-3">
          <ContactAvatar name={contact.name} photoUrl={contact.photoUrl} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getRelationshipColor(
                  contact.relationshipType
                )}`}
              >
                {contact.relationshipType}
              </span>
            </div>

            {contact.nickname && (
              <p className="text-sm text-gray-500 truncate">&ldquo;{contact.nickname}&rdquo;</p>
            )}

            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              {lastCheckin ? (
                <span>Last contact: {formatTimeAgo(new Date(lastCheckin.contactedAt))}</span>
              ) : (
                <span className="text-amber-600">Never contacted</span>
              )}

              {hasBirthday && daysUntilBirthday !== null && daysUntilBirthday <= 30 && (
                <span className="text-rose-600 font-medium">
                  🎂 {daysUntilBirthday === 0 ? 'Today!' : `in ${daysUntilBirthday}d`}
                </span>
              )}
            </div>

            {(contact.phone || contact.email) && (
              <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                {preferredContactIcons[contact.preferredContact]}
                <span className="truncate">{contact.phone || contact.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
