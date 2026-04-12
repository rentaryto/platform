-- Migración manual para Supabase
-- Ejecutar este SQL en el SQL Editor de Supabase
--
-- NOTA: Trial period es de 3 MESES desde trialStartDate

-- 1. Crear tabla Subscription
CREATE TABLE "Subscription" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'trial', -- valores: trial, active, cancelled, expired
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

-- 3. Crear subscriptions para TODOS los usuarios existentes
-- IMPORTANTE: Ejecuta esto después de crear la tabla
-- Los usuarios existentes reciben plan 'legacy' con acceso extendido
INSERT INTO "Subscription" ("userId", "status", "trialStartDate", "trialEndDate", "plan", "maxProperties")
SELECT
  u."id" as "userId",
  'active' as "status",  -- Usuarios existentes → activos (recompensa early adopters)
  CURRENT_TIMESTAMP as "trialStartDate",
  CURRENT_TIMESTAMP + INTERVAL '1 year' as "trialEndDate",
  'legacy' as "plan",  -- Plan especial para usuarios existentes
  100 as "maxProperties"  -- Sin límite práctico (vs 5 de usuarios nuevos)
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1 FROM "Subscription" s WHERE s."userId" = u."id"
);

-- 4. (Opcional) Para tu usuario administrador específicamente:
-- Ejecuta esto con tu user ID si quieres acceso ilimitado
-- UPDATE "Subscription"
-- SET "status" = 'active',
--     "trialEndDate" = CURRENT_TIMESTAMP + INTERVAL '10 years',
--     "plan" = 'admin',
--     "maxProperties" = 999
-- WHERE "userId" = 'TU_USER_ID_AQUI';

-- NOTAS:
-- - Los nuevos usuarios automáticamente reciben trial de 3 meses (handled by code)
-- - Los usuarios existentes reciben plan 'legacy' con 1 año + 100 propiedades
-- - Esto es justo para early adopters que ya están usando el producto
