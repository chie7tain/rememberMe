import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getNextOccurrence, getDaysUntil, isOverdue, getDaysOverdue } from '@/lib/utils'

export async function GET() {
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

  // Upcoming birthdays within 30 days
  const upcomingBirthdays = contacts
    .filter((c) => c.birthday !== null)
    .map((c) => {
      const bday = c.birthday as Date
      const daysUntil = getDaysUntil(bday)
      return { ...c, daysUntil }
    })
    .filter((c) => c.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  // Overdue check-ins
  const overdueCheckins = contacts
    .map((c) => {
      const lastCheckin = c.checkins[0] ?? null
      const lastCheckedIn = lastCheckin ? lastCheckin.contactedAt : null
      const daysOverdue = getDaysOverdue(c.checkInFrequency, lastCheckedIn)
      return { ...c, daysOverdue, lastCheckedIn }
    })
    .filter((c) => isOverdue(c.checkInFrequency, c.lastCheckedIn))
    .sort((a, b) => b.daysOverdue - a.daysOverdue)

  // Upcoming special occasions within 30 days (excluding birthdays which are already tracked)
  const upcomingOccasions = occasions
    .filter((o) => o.type !== 'birthday')
    .map((o) => {
      const daysUntil = getDaysUntil(o.date)
      return { ...o, daysUntil }
    })
    .filter((o) => o.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  return NextResponse.json({
    upcomingBirthdays,
    overdueCheckins,
    upcomingOccasions,
  })
}
