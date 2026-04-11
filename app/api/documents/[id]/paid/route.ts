import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const { paid } = body

    // Verify document belongs to user
    const document = await prisma.document.findFirst({
      where: {
        id: params.id,
        apartment: {
          userId: user.id,
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Documento no encontrado' }, { status: 404 })
    }

    if (document.type !== 'invoice') {
      return NextResponse.json(
        { error: 'Solo se pueden marcar facturas como pagadas' },
        { status: 400 }
      )
    }

    const updated = await prisma.document.update({
      where: { id: params.id },
      data: {
        paidStatus: paid ? 'paid' : 'unpaid',
        paidAt: paid ? new Date() : null,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { error: 'Error al actualizar estado de pago' },
      { status: 500 }
    )
  }
}
