import type { Contact, SpecialOccasion, CheckIn } from '@prisma/client'

export type { Contact, SpecialOccasion, CheckIn }

export interface ContactWithMeta extends Contact {
  occasions: SpecialOccasion[]
  checkins: CheckIn[]
  lastCheckedIn?: Date | null
  daysOverdue?: number
}

export interface DashboardData {
  upcomingBirthdays: Array<Contact & { daysUntil: number }>
  overdueCheckins: Array<Contact & { daysOverdue: number; lastCheckedIn: Date | null }>
  upcomingOccasions: Array<SpecialOccasion & { contact: Contact; daysUntil: number }>
}
