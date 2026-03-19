import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// Today is 2026-03-19
const TODAY = new Date('2026-03-19')

function daysFromToday(days: number): Date {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + days)
  return d
}

function daysAgo(days: number): Date {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - days)
  return d
}

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.checkIn.deleteMany()
  await prisma.specialOccasion.deleteMany()
  await prisma.contact.deleteMany()

  // 1. Sarah Chen - best friend, birthday in 5 days
  const birthdaySarah = new Date(1992, daysFromToday(5).getMonth(), daysFromToday(5).getDate())
  const sarah = await prisma.contact.create({
    data: {
      name: 'Sarah Chen',
      nickname: 'Sare',
      phone: '+1 (415) 555-0101',
      email: 'sarah.chen@example.com',
      birthday: birthdaySarah,
      birthdayYearKnown: true,
      relationshipType: 'friend',
      notes: 'Best friend from college. Loves hiking and photography. Currently working at a tech startup in SF.',
      preferredContact: 'text',
      checkInFrequency: 'weekly',
      checkins: {
        create: [
          {
            method: 'text',
            contactedAt: daysAgo(2),
            notes: 'Texted about weekend plans',
          },
          {
            method: 'in_person',
            contactedAt: daysAgo(10),
            notes: 'Grabbed coffee at Blue Bottle',
          },
        ],
      },
      occasions: {
        create: [
          {
            type: 'anniversary',
            label: 'Friendiversary',
            date: new Date(2018, 8, 15), // Sep 15
            yearKnown: true,
            recurring: true,
            notes: 'The day we met at freshman orientation',
          },
        ],
      },
    },
  })
  console.log('Created Sarah Chen')

  // 2. Marcus Johnson - family member, birthday in 12 days, overdue for check-in
  const birthdayMarcus = new Date(1985, daysFromToday(12).getMonth(), daysFromToday(12).getDate())
  const marcus = await prisma.contact.create({
    data: {
      name: 'Marcus Johnson',
      nickname: 'Marc',
      phone: '+1 (312) 555-0202',
      email: 'marcus.j@example.com',
      birthday: birthdayMarcus,
      birthdayYearKnown: true,
      relationshipType: 'family',
      notes: 'Older brother. Lives in Chicago. Works in finance. Has two kids: Emma (7) and Liam (4).',
      preferredContact: 'call',
      checkInFrequency: 'monthly',
      checkins: {
        create: [
          {
            method: 'call',
            contactedAt: daysAgo(45),
            notes: 'Caught up over the phone for his birthday last year',
          },
        ],
      },
      occasions: {
        create: [
          {
            type: 'work_anniversary',
            label: 'Goldman Sachs Anniversary',
            date: new Date(2015, 5, 1), // June 1
            yearKnown: true,
            recurring: true,
          },
        ],
      },
    },
  })
  console.log('Created Marcus Johnson')

  // 3. Elena Vasquez - friend, birthday coming up soon (25 days), overdue for check-in
  const birthdayElena = new Date(1995, daysFromToday(25).getMonth(), daysFromToday(25).getDate())
  const elena = await prisma.contact.create({
    data: {
      name: 'Elena Vasquez',
      nickname: null,
      phone: '+1 (213) 555-0303',
      email: 'elena.v@example.com',
      birthday: birthdayElena,
      birthdayYearKnown: true,
      relationshipType: 'friend',
      notes: 'Met at a book club. Huge foodie and always has great restaurant recommendations. Her dog is named Churro.',
      preferredContact: 'email',
      checkInFrequency: 'biweekly',
      checkins: {
        create: [
          {
            method: 'email',
            contactedAt: daysAgo(30),
            notes: 'Shared a recipe',
          },
        ],
      },
      occasions: {
        create: [
          {
            type: 'anniversary',
            label: 'Book Club Anniversary',
            date: new Date(2024, 0, 15), // Jan 15
            yearKnown: true,
            recurring: true,
            notes: 'One year since joining the book club together',
          },
        ],
      },
    },
  })
  console.log('Created Elena Vasquez')

  // 4. David Kim - acquaintance, no birthday set, never contacted (overdue)
  const david = await prisma.contact.create({
    data: {
      name: 'David Kim',
      nickname: 'Dave',
      phone: '+1 (617) 555-0404',
      email: 'david.kim@example.com',
      birthday: null,
      birthdayYearKnown: true,
      relationshipType: 'acquaintance',
      notes: 'Networking contact from the 2025 SaaS conference. Works at a VC firm in Boston. Interested in AI startups.',
      preferredContact: 'email',
      checkInFrequency: 'quarterly',
    },
  })
  console.log('Created David Kim')

  // 5. Mom - family, birthday year unknown (use month/day only), overdue
  const birthdayMom = new Date(1904, daysFromToday(18).getMonth(), daysFromToday(18).getDate())
  const mom = await prisma.contact.create({
    data: {
      name: 'Linda Park',
      nickname: 'Mom',
      phone: '+1 (503) 555-0505',
      email: null,
      birthday: birthdayMom,
      birthdayYearKnown: false,
      relationshipType: 'family',
      notes: 'Call every Sunday morning. Likes when I send photos. Allergic to cats.',
      preferredContact: 'call',
      checkInFrequency: 'weekly',
      checkins: {
        create: [
          {
            method: 'call',
            contactedAt: daysAgo(14),
            notes: 'Sunday call, talked about the garden',
          },
        ],
      },
    },
  })
  console.log('Created Linda Park (Mom)')

  console.log('\nSeed completed successfully!')
  console.log(`Created ${5} contacts`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
