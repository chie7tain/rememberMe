import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const occasions = await prisma.specialOccasion.findMany({
    where: { contactId: id },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(occasions)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const { type, label, date, yearKnown, recurring, notes } = body

  if (!type || !date) {
    return NextResponse.json({ error: 'Type and date are required' }, { status: 400 })
  }

  const occasion = await prisma.specialOccasion.create({
    data: {
      contactId: id,
      type,
      label: label?.trim() || null,
      date: new Date(date),
      yearKnown: yearKnown ?? true,
      recurring: recurring ?? true,
      notes: notes?.trim() || null,
    },
  })

  return NextResponse.json(occasion, { status: 201 })
}
