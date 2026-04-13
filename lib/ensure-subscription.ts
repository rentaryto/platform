import { prisma } from '@/lib/prisma'
import { calculateTrialEndDate } from '@/lib/subscription-utils'
import { toDomainSubscription } from '@/lib/mappers/subscription'
import { DEFAULT_TRIAL_PLAN, TRIAL_MAX_PROPERTIES } from '@/lib/subscription-plans'
import type { Subscription } from '@/lib/types'

/**
 * Garantiza que un usuario tiene una suscripción activa.
 * Si no existe, crea automáticamente un trial de 3 meses con límite de 10 inmuebles.
 *
 * @param userId - ID del usuario
 * @returns Subscription en formato de dominio
 */
export async function ensureSubscription(userId: string): Promise<Subscription> {
  // Intentar obtener subscription existente
  let prismaSubscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  // Si no existe, crear trial automáticamente
  if (!prismaSubscription) {
    console.log('[ENSURE SUBSCRIPTION] No subscription found for user:', userId)
    console.log('[ENSURE SUBSCRIPTION] Creating automatic 3-month trial with', TRIAL_MAX_PROPERTIES, 'properties limit')

    const trialStartDate = new Date()
    const trialEndDate = calculateTrialEndDate(trialStartDate)

    prismaSubscription = await prisma.subscription.create({
      data: {
        userId,
        status: 'trial',
        plan: DEFAULT_TRIAL_PLAN,
        maxProperties: TRIAL_MAX_PROPERTIES,
        trialStartDate,
        trialEndDate,
      },
    })

    console.log('[ENSURE SUBSCRIPTION] Trial created successfully until:', trialEndDate)
  }

  return toDomainSubscription(prismaSubscription)
}
