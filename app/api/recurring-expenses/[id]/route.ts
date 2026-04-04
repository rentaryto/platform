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
    const { name, amount, frequency } = body

    // Verify expense belongs to user
    const expense = await prisma.recurringExpense.findFirst({
      where: {
        id: params.id,
        apartment: {
          userId: user.id,
        },
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 })
    }

    const updated = await prisma.recurringExpense.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(amount && { amount }),
        ...(frequency && { frequency }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating recurring expense:', error)
    return NextResponse.json(
      { error: 'Error al actualizar gasto recurrente' },
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
    // Verify expense belongs to user
    const expense = await prisma.recurringExpense.findFirst({
      where: {
        id: params.id,
        apartment: {
          userId: user.id,
        },
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 })
    }

    await prisma.recurringExpense.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting recurring expense:', error)
    return NextResponse.json(
      { error: 'Error al eliminar gasto recurrente' },
      { status: 500 }
    )
  }
}
