import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ContactDetailClient from '@/components/contacts/ContactDetailClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      occasions: { orderBy: { date: 'asc' } },
      checkins: { orderBy: { contactedAt: 'desc' } },
    },
  })

  if (!contact) {
    notFound()
  }

  return <ContactDetailClient contact={contact} />
}
