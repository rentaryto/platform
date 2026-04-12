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

  const apartment = await prisma.apartment.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
    include: {
      currentTenant: true,
      recurringExpenses: true,
      unexpectedExpenses: {
        orderBy: { date: 'desc' },
      },
      documents: {
        orderBy: { createdAt: 'desc' },
      },
      reminders: {
        orderBy: { dueDate: 'asc' },
      },
    },
  })

  if (!apartment) {
    return NextResponse.json({ error: 'Inmueble no encontrado' }, { status: 404 })
  }

  return NextResponse.json(apartment)
}

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
    const { name, address, cadastralReference, rentAmount, purchasePrice, status } = body

    // Verify ownership
    const apartment = await prisma.apartment.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!apartment) {
      return NextResponse.json({ error: 'Inmueble no encontrado' }, { status: 404 })
    }

    const updated = await prisma.apartment.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(cadastralReference !== undefined && { cadastralReference }),
        ...(rentAmount && { rentAmount }),
        ...(purchasePrice !== undefined && { purchasePrice }),
        ...(status && { status }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating apartment:', error)
    return NextResponse.json(
      { error: 'Error al actualizar inmueble' },
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
    // Verify ownership
    const apartment = await prisma.apartment.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!apartment) {
      return NextResponse.json({ error: 'Inmueble no encontrado' }, { status: 404 })
    }

    await prisma.apartment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting apartment:', error)
    return NextResponse.json(
      { error: 'Error al eliminar inmueble' },
      { status: 500 }
    )
  }
}
