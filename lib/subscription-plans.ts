/**
 * Definición de los planes de suscripción disponibles en Rentaryto
 */

export type PlanType = "basic" | "professional" | "enterprise";

export interface SubscriptionPlan {
  id: PlanType;
  name: string;
  price: number; // €/mes (mensual)
  priceYearly: number; // €/año (anual)
  maxProperties: number;
  features: string[];
  description: string;
}

export const SUBSCRIPTION_PLANS: Record<PlanType, SubscriptionPlan> = {
  basic: {
    id: "basic",
    name: "Básico",
    price: 1.80,
    priceYearly: 18.00,
    maxProperties: 1,
    description: "1 inmueble",
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
    price: 5.40,
    priceYearly: 54.00,
    maxProperties: 5,
    description: "Hasta 5 inmuebles",
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
    priceYearly: 0, // Precio personalizado
    maxProperties: 999, // Ilimitado (número grande)
    description: "Más de 5 inmuebles",
    features: [
      "Todo lo incluido",
      "Sin límite de inmuebles",
      "Soporte prioritario",
      "Funcionalidades a medida",
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
  if (propertyCount <= 1) return "basic";
  if (propertyCount <= 5) return "professional";
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
export const TRIAL_MAX_PROPERTIES = 1; // Trial tiene el mismo límite que plan básico
