import ContactForm from '@/components/contacts/ContactForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NewContactPage() {
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
        <span className="text-sm text-gray-900 font-medium">New Contact</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Contact</h1>

      <div className="max-w-2xl">
        <ContactForm mode="create" />
      </div>
    </div>
  )
}
