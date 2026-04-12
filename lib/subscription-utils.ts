import type { Subscription } from '@prisma/client'

/**
 * Calcula la fecha de fin del trial (3 meses desde la fecha de inicio)
 */
export function calculateTrialEndDate(startDate: Date): Date {
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + 3)
  return endDate
}

/**
 * Verifica si el trial ha expirado
 */
export function isTrialExpired(subscription: Subscription): boolean {
  if (subscription.status !== 'trial') return false
  const now = new Date()
  const trialEnd = new Date(subscription.trialEndDate)
  return now > trialEnd
}

/**
 * Verifica si el usuario puede añadir más propiedades
 */
export function canAddProperty(subscription: Subscription, currentCount: number): boolean {
  // Si el trial ha expirado y no está activo, no puede añadir
  if (subscription.status === 'expired' || subscription.status === 'cancelled') {
    return false
  }

  // Verificar límite de propiedades
  return currentCount < subscription.maxProperties
}

/**
 * Calcula días restantes de trial
 */
export function calculateDaysRemaining(trialEndDate: string | Date): number {
  const now = new Date()
  const end = new Date(trialEndDate)
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Obtiene el estado completo de la suscripción
 */
export function getSubscriptionStatus(
  subscription: Subscription,
  currentProperties: number
): {
  status: Subscription['status']
  daysRemaining: number
  maxProperties: number
  currentProperties: number
  canAddMore: boolean
} {
  const daysRemaining = subscription.status === 'trial'
    ? calculateDaysRemaining(subscription.trialEndDate)
    : 0

  const canAddMore = canAddProperty(subscription, currentProperties)

  return {
    status: subscription.status,
    daysRemaining,
    maxProperties: subscription.maxProperties,
    currentProperties,
    canAddMore,
  }
}
