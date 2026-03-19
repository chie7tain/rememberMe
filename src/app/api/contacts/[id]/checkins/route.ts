import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const checkins = await prisma.checkIn.findMany({
    where: { contactId: id },
    orderBy: { contactedAt: 'desc' },
  })

  return NextResponse.json(checkins)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const { method, contactedAt, notes } = body

  if (!method) {
    return NextResponse.json({ error: 'Method is required' }, { status: 400 })
  }

  const checkin = await prisma.checkIn.create({
    data: {
      contactId: id,
      method,
      contactedAt: contactedAt ? new Date(contactedAt) : new Date(),
      notes: notes?.trim() || null,
    },
  })

  return NextResponse.json(checkin, { status: 201 })
}
