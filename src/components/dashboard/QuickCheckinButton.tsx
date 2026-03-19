'use client'

import { useState } from 'react'
import LogCheckinModal from '@/components/contacts/LogCheckinModal'
import { CheckCircle } from 'lucide-react'

interface Props {
  contactId: string
  contactName: string
}

export default function QuickCheckinButton({ contactId, contactName }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium border border-rose-200 hover:border-rose-300 px-2.5 py-1.5 rounded-lg transition-colors"
      >
        <CheckCircle className="w-3.5 h-3.5" />
        Log Check-in
      </button>

      {showModal && (
        <LogCheckinModal
          contactId={contactId}
          contactName={contactName}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
