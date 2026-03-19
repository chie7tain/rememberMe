import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; occasionId: string }> }
) {
  const { occasionId } = await params
  const body = await request.json()

  const { type, label, date, yearKnown, recurring, notes } = body

  if (!type || !date) {
    return NextResponse.json({ error: 'Type and date are required' }, { status: 400 })
  }

  const occasion = await prisma.specialOccasion.update({
    where: { id: occasionId },
    data: {
      type,
      label: label?.trim() || null,
      date: new Date(date),
      yearKnown: yearKnown ?? true,
      recurring: recurring ?? true,
      notes: notes?.trim() || null,
    },
  })

  return NextResponse.json(occasion)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; occasionId: string }> }
) {
  const { occasionId } = await params

  await prisma.specialOccasion.delete({ where: { id: occasionId } })

  return NextResponse.json({ success: true })
}
