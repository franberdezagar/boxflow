-- Migración para actualizar condición fiscal a 3 tipos
-- Agregar EFECTIVO_BLANCO y EFECTIVO_NEGRO

-- 1. Actualizar tabla turnos - agregar nuevos campos
ALTER TABLE "turnos" 
ADD COLUMN "efectivo_inicial_efectivo_blanco" NUMERIC(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN "efectivo_inicial_efectivo_negro" NUMERIC(12,2) NOT NULL DEFAULT 0.00,
ADD COLUMN "efectivo_final_efectivo_blanco_esperado" NUMERIC(12,2),
ADD COLUMN "efectivo_final_efectivo_negro_esperado" NUMERIC(12,2),
ADD COLUMN "efectivo_final_efectivo_blanco_declarado" NUMERIC(12,2),
ADD COLUMN "efectivo_final_efectivo_negro_declarado" NUMERIC(12,2);

-- 2. Migrar datos existentes de efectivo a efectivo_blanco
UPDATE "turnos" 
SET "efectivo_inicial_efectivo_blanco" = "efectivo_inicial_efectivo",
    "efectivo_final_efectivo_blanco_esperado" = "efectivo_final_efectivo_esperado",
    "efectivo_final_efectivo_blanco_declarado" = "efectivo_final_efectivo_declarado";

-- 3. Eliminar columnas antiguas de efectivo
ALTER TABLE "turnos" 
DROP COLUMN "efectivo_inicial_efectivo",
DROP COLUMN "efectivo_final_efectivo_esperado",
DROP COLUMN "efectivo_final_efectivo_declarado";

-- 4. Actualizar enum de condicion_fiscal en movimientos
-- Primero migrar datos existentes de 'EFECTIVO' a 'EFECTIVO_BLANCO'
UPDATE "movimientos" 
SET "condicion_fiscal" = 'EFECTIVO_BLANCO' 
WHERE "condicion_fiscal" = 'EFECTIVO';

-- 5. Actualizar constraint de condicion_fiscal
ALTER TABLE "movimientos" 
DROP CONSTRAINT IF EXISTS "movimientos_condicion_fiscal_check";

ALTER TABLE "movimientos" 
ADD CONSTRAINT "movimientos_condicion_fiscal_check" 
CHECK ("condicion_fiscal" IN ('BLANCO', 'EFECTIVO_BLANCO', 'EFECTIVO_NEGRO'));