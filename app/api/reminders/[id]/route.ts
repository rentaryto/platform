import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, dueDate, status } = body

    // Verify reminder belongs to user
    const reminder = await prisma.reminder.findFirst({
      where: {
        id: params.id,
        apartment: {
          userId: user.id,
        },
      },
    })

    if (!reminder) {
      return NextResponse.json({ error: 'Recordatorio no encontrado' }, { status: 404 })
    }

    const updated = await prisma.reminder.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(status && { status }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating reminder:', error)
    return NextResponse.json(
      { error: 'Error al actualizar recordatorio' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Verify reminder belongs to user
    const reminder = await prisma.reminder.findFirst({
      where: {
        id: params.id,
        apartment: {
          userId: user.id,
        },
      },
    })

    if (!reminder) {
      return NextResponse.json({ error: 'Recordatorio no encontrado' }, { status: 404 })
    }

    await prisma.reminder.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json(
      { error: 'Error al eliminar recordatorio' },
      { status: 500 }
    )
  }
}
