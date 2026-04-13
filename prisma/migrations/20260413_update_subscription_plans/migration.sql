-- UpdateSubscriptionPlans migration
-- Actualiza el modelo de suscripción para los nuevos planes

-- Actualizar suscripciones existentes con plan "standard" a "basic"
-- Si están en trial, permitir hasta 10 inmuebles para que prueben
UPDATE "Subscription"
SET
  "plan" = 'basic',
  "maxProperties" = CASE
    WHEN "status" = 'trial' THEN 10
    ELSE 3
  END
WHERE "plan" = 'standard';

-- Actualizar cualquier otro plan no reconocido a "basic"
UPDATE "Subscription"
SET
  "plan" = 'basic',
  "maxProperties" = CASE
    WHEN "status" = 'trial' THEN 10
    ELSE 3
  END
WHERE "plan" NOT IN ('basic', 'professional', 'enterprise');
