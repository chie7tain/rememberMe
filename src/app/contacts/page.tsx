import { prisma } from '@/lib/prisma'
import ContactCard from '@/components/contacts/ContactCard'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    include: {
      checkins: {
        orderBy: { contactedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">
            {contacts.length} {contacts.length === 1 ? 'person' : 'people'} in your network
          </p>
        </div>
        <Link
          href="/contacts/new"
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Contact
        </Link>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">No contacts yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Start building your network by adding your first contact.
          </p>
          <Link
            href="/contacts/new"
            className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add your first contact
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  )
}
