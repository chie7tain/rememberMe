import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''

  const contacts = await prisma.contact.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { nickname: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : undefined,
    include: {
      checkins: {
        orderBy: { contactedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(contacts)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const {
    name,
    nickname,
    phone,
    email,
    birthday,
    birthdayYearKnown,
    relationshipType,
    notes,
    preferredContact,
    photoUrl,
    checkInFrequency,
  } = body

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const contact = await prisma.contact.create({
    data: {
      name: name.trim(),
      nickname: nickname?.trim() || null,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      birthday: birthday ? new Date(birthday) : null,
      birthdayYearKnown: birthdayYearKnown ?? true,
      relationshipType: relationshipType ?? 'friend',
      notes: notes?.trim() || null,
      preferredContact: preferredContact ?? 'text',
      photoUrl: photoUrl?.trim() || null,
      checkInFrequency: checkInFrequency ?? 'monthly',
    },
  })

  return NextResponse.json(contact, { status: 201 })
}
