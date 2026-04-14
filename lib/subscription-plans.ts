/**
 * Definición de los planes de suscripción disponibles en Rentaryto
 */

export type PlanType = "basic" | "professional" | "enterprise";

export interface SubscriptionPlan {
  id: PlanType;
  name: string;
  price: number; // €/mes
  maxProperties: number;
  features: string[];
  description: string;
}

export const SUBSCRIPTION_PLANS: Record<PlanType, SubscriptionPlan> = {
  basic: {
    id: "basic",
    name: "Básico",
    price: 2.90,
    maxProperties: 3,
    description: "Hasta 3 inmuebles",
    features: [
      "Gestión de inmuebles",
      "Gestión de inquilinos",
      "Control de gastos",
      "Contratos y facturas",
      "Envío de documentos",
      "Recordatorios",
      "Informes para Hacienda",
    ],
  },
  professional: {
    id: "professional",
    name: "Profesional",
    price: 6.90,
    maxProperties: 10,
    description: "Hasta 10 inmuebles",
    features: [
      "Gestión de inmuebles",
      "Gestión de inquilinos",
      "Control de gastos",
      "Contratos y facturas",
      "Envío de documentos",
      "Recordatorios",
      "Informes para Hacienda",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Empresarial",
    price: 0, // Precio personalizado
    maxProperties: 999, // Ilimitado (número grande)
    description: "Más de 10 inmuebles",
    features: [
      "Todo lo incluido",
      "Sin límite de inmuebles",
    ],
  },
};

/**
 * Obtiene el plan por su ID
 */
export function getPlanById(planId: PlanType): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[planId];
}

/**
 * Obtiene el plan recomendado según el número de propiedades
 */
export function getRecommendedPlan(propertyCount: number): PlanType {
  if (propertyCount <= 3) return "basic";
  if (propertyCount <= 10) return "professional";
  return "enterprise";
}

/**
 * Verifica si un plan puede soportar el número de propiedades
 */
export function canPlanSupportProperties(planId: PlanType, propertyCount: number): boolean {
  const plan = getPlanById(planId);
  return propertyCount <= plan.maxProperties;
}

/**
 * Constantes del trial
 */
export const TRIAL_DURATION_MONTHS = 3;
export const DEFAULT_TRIAL_PLAN: PlanType = "basic";
export const TRIAL_MAX_PROPERTIES = 3; // Trial tiene el mismo límite que plan básico
