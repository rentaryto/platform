import type { Subscription as PrismaSubscription } from '@prisma/client'
import type { Subscription } from '@/lib/types'

/**
 * Convierte un Subscription de Prisma a tipo de dominio
 * Valida que el status sea uno de los valores permitidos
 */
export function toDomainSubscription(
  prismaData: PrismaSubscription
): Subscription {
  // Validar que el status sea válido
  const validStatuses = ['trial', 'active', 'cancelled', 'expired'] as const
  const status = prismaData.status as Subscription['status']

  if (!validStatuses.includes(status)) {
    console.warn(`Invalid subscription status: ${prismaData.status}, defaulting to 'trial'`)
    return {
      ...prismaData,
      status: 'trial',
    }
  }

  return {
    ...prismaData,
    status,
  }
}
