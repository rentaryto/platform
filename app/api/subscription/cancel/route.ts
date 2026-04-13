import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const authUser = await requireAuth(request)

  if (!authUser) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // TODO: Implementar cancelación de suscripción en Stripe cuando esté disponible
    // Por ahora, solo actualizamos el estado en la base de datos

    const subscription = await prisma.subscription.findUnique({
      where: { userId: authUser.id },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'No se encontró suscripción activa' },
        { status: 404 }
      )
    }

    if (subscription.status === 'cancelled' || subscription.status === 'expired') {
      return NextResponse.json(
        { error: 'La suscripción ya está cancelada o expirada' },
        { status: 400 }
      )
    }

    // Actualizar estado a cancelado
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: authUser.id },
      data: { status: 'cancelled' },
    })

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada correctamente',
      subscription: updatedSubscription,
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Error al cancelar la suscripción' },
      { status: 500 }
    )
  }
}
