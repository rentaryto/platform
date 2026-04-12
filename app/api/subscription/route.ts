import { requireAuth } from '@/lib/api-auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSubscriptionStatus, isTrialExpired } from '@/lib/subscription-utils'
import { toDomainSubscription } from '@/lib/mappers/subscription'
import { ensureSubscription } from '@/lib/ensure-subscription'

export async function GET(request: NextRequest) {
  const user = await requireAuth(request)

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    // Garantizar que el usuario tiene subscription (crea si no existe)
    let subscription = await ensureSubscription(user.id)

    // Actualizar status si el trial ha expirado
    if (isTrialExpired(subscription) && subscription.status === 'trial') {
      const updatedPrisma = await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' },
      })
      subscription = toDomainSubscription(updatedPrisma)
    }

    // Contar propiedades actuales
    const currentProperties = await prisma.apartment.count({
      where: { userId: user.id },
    })

    // Obtener estado completo
    const status = getSubscriptionStatus(subscription, currentProperties)

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Error al obtener suscripción' },
      { status: 500 }
    )
  }
}
