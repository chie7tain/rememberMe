import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      occasions: { orderBy: { date: 'asc' } },
      checkins: { orderBy: { contactedAt: 'desc' }, take: 10 },
    },
  })

  if (!contact) {
    return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
  }

  return NextResponse.json(contact)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  const contact = await prisma.contact.update({
    where: { id },
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

  return NextResponse.json(contact)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.contact.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
