import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSubscriptionStatus, isTrialExpired } from '@/lib/subscription-utils'

export async function GET(request: NextRequest) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Obtener suscripción del usuario
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'No se encontró suscripción' },
        { status: 404 }
      )
    }

    // Actualizar status si el trial ha expirado
    let currentSubscription = subscription
    if (isTrialExpired(subscription) && subscription.status === 'trial') {
      currentSubscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' },
      })
    }

    // Contar propiedades actuales
    const currentProperties = await prisma.apartment.count({
      where: { userId: user.id },
    })

    // Obtener estado completo
    const status = getSubscriptionStatus(currentSubscription, currentProperties)

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Error al obtener suscripción' },
      { status: 500 }
    )
  }
}
