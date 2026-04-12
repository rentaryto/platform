-- Migración manual para Supabase
-- Ejecutar este SQL en el SQL Editor de Supabase
--
-- NOTA: Trial period es de 3 MESES desde trialStartDate

-- 1. Crear tabla Subscription
CREATE TABLE "Subscription" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'trial',
  "plan" TEXT NOT NULL DEFAULT 'standard',
  "maxProperties" INTEGER NOT NULL DEFAULT 5,
  "trialStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "trialEndDate" TIMESTAMP(3) NOT NULL,
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 2. Crear índice
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- 3. Crear suscripción trial para usuarios existentes (opcional, solo si hay usuarios)
-- IMPORTANTE: Ajustar las fechas según necesites
-- INSERT INTO "Subscription" ("userId", "status", "trialStartDate", "trialEndDate")
-- SELECT
--   "id" as "userId",
--   'trial' as "status",
--   CURRENT_TIMESTAMP as "trialStartDate",
--   CURRENT_TIMESTAMP + INTERVAL '3 months' as "trialEndDate"
-- FROM "User"
-- WHERE NOT EXISTS (
--   SELECT 1 FROM "Subscription" WHERE "Subscription"."userId" = "User"."id"
-- );

-- Para tu usuario específico, ejecuta esto después de la migración:
-- UPDATE "Subscription"
-- SET "status" = 'active', "trialEndDate" = CURRENT_TIMESTAMP + INTERVAL '1 year'
-- WHERE "userId" = 'TU_USER_ID';
