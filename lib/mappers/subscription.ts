import type { Subscription as PrismaSubscription } from '@prisma/client'
import type { Subscription, PlanType } from '@/lib/types'

/**
 * Convierte un Subscription de Prisma a tipo de dominio
 * Valida que el status y plan sean valores permitidos
 */
export function toDomainSubscription(
  prismaData: PrismaSubscription
): Subscription {
  // Validar que el status sea válido
  const validStatuses = ['trial', 'active', 'cancelled', 'expired'] as const
  const status = prismaData.status as Subscription['status']

  if (!validStatuses.includes(status)) {
    console.warn(`Invalid subscription status: ${prismaData.status}, defaulting to 'trial'`)
  }

  // Validar que el plan sea válido
  const validPlans = ['basic', 'professional', 'enterprise'] as const
  const plan = prismaData.plan as PlanType

  if (!validPlans.includes(plan)) {
    console.warn(`Invalid subscription plan: ${prismaData.plan}, defaulting to 'basic'`)
  }

  return {
    ...prismaData,
    status: validStatuses.includes(status) ? status : 'trial',
    plan: validPlans.includes(plan) ? plan : 'basic',
  }
}
