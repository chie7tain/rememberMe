import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ContactForm from '@/components/contacts/ContactForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditContactPage({ params }: Props) {
  const { id } = await params

  const contact = await prisma.contact.findUnique({ where: { id } })

  if (!contact) {
    notFound()
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/contacts"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Contacts
        </Link>
        <span className="text-gray-300">/</span>
        <Link
          href={`/contacts/${id}`}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {contact.name}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">Edit</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit {contact.name}</h1>

      <div className="max-w-2xl">
        <ContactForm contact={contact} mode="edit" />
      </div>
    </div>
  )
}
