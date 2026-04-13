-- UpdateSubscriptionPlans migration
-- Actualiza el modelo de suscripción para los nuevos planes

-- Actualizar suscripciones existentes con plan "standard" a "basic"
UPDATE "Subscription"
SET
  "plan" = 'basic',
  "maxProperties" = 3
WHERE "plan" = 'standard';

-- Actualizar cualquier otro plan no reconocido a "basic"
UPDATE "Subscription"
SET
  "plan" = 'basic',
  "maxProperties" = 3
WHERE "plan" NOT IN ('basic', 'professional', 'enterprise');
