import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Verify apartment ownership
  const apartment = await prisma.apartment.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
  })

  if (!apartment) {
    return NextResponse.json({ error: 'Inmueble no encontrado' }, { status: 404 })
  }

  const reminders = await prisma.reminder.findMany({
    where: { apartmentId: params.id },
    orderBy: { dueDate: 'asc' },
  })

  return NextResponse.json(reminders)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, dueDate } = body

    if (!title || !dueDate) {
      return NextResponse.json(
        { error: 'Título y fecha son requeridos' },
        { status: 400 }
      )
    }

    // Verify apartment ownership
    const apartment = await prisma.apartment.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!apartment) {
      return NextResponse.json({ error: 'Inmueble no encontrado' }, { status: 404 })
    }

    const reminder = await prisma.reminder.create({
      data: {
        apartmentId: params.id,
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        status: 'pending',
      },
    })

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: 'Error al crear recordatorio' },
      { status: 500 }
    )
  }
}
