-- Crear tablas para BoxFlow - Sistema de Gestión de Tesorería y Caja Diaria
-- Adaptado para PostgreSQL con Sequelize

-- Tabla: turnos
CREATE TABLE IF NOT EXISTS "turnos" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre_turno" VARCHAR(10) NOT NULL CHECK ("nombre_turno" IN ('MAÑANA', 'TARDE')),
  "fecha_apertura" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fecha_cierre" TIMESTAMP,
  "estado" VARCHAR(10) NOT NULL DEFAULT 'ABIERTO' CHECK ("estado" IN ('ABIERTO', 'CERRADO')),
  "efectivo_inicial_blanco" NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  "efectivo_inicial_negro" NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  "efectivo_final_blanco_esperado" NUMERIC(12,2),
  "efectivo_final_negro_esperado" NUMERIC(12,2),
  "efectivo_final_blanco_declarado" NUMERIC(12,2),
  "efectivo_final_negro_declarado" NUMERIC(12,2),
  "notas" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_turnos_estado_apertura ON "turnos"("estado", "fecha_apertura");
CREATE INDEX idx_turnos_fecha_cierre ON "turnos"("fecha_cierre");

-- Tabla: proveedores
CREATE TABLE IF NOT EXISTS "proveedores" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "razon_social" VARCHAR(255) NOT NULL UNIQUE,
  "telefono" VARCHAR(20),
  "email" VARCHAR(255),
  "contacto" VARCHAR(255),
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: empleados
CREATE TABLE IF NOT EXISTS "empleados" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre_completo" VARCHAR(255) NOT NULL,
  "rol" VARCHAR(20) NOT NULL DEFAULT 'CAJERO' CHECK ("rol" IN ('CAJERO', 'GERENTE', 'ADMIN')),
  "email" VARCHAR(255) UNIQUE,
  "telefono" VARCHAR(20),
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: movimientos
CREATE TABLE IF NOT EXISTS "movimientos" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "turno_id" UUID NOT NULL,
  "tipo_movimiento" VARCHAR(10) NOT NULL CHECK ("tipo_movimiento" IN ('INGRESO', 'EGRESO')),
  "categoria" VARCHAR(20) NOT NULL CHECK ("categoria" IN ('VENTA', 'PROVEEDOR', 'SUELDO', 'VARIOS')),
  "condicion_fiscal" VARCHAR(10) NOT NULL CHECK ("condicion_fiscal" IN ('BLANCO', 'NEGRO')),
  "monto" NUMERIC(12,2) NOT NULL,
  "proveedor_id" UUID,
  "empleado_id" UUID,
  "fecha_hora" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "descripcion" TEXT,
  "comprobante" VARCHAR(100),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("turno_id") REFERENCES "turnos"("id") ON DELETE CASCADE,
  FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL,
  FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id") ON DELETE SET NULL
);

CREATE INDEX idx_movimientos_turno_fecha ON "movimientos"("turno_id", "fecha_hora");
CREATE INDEX idx_movimientos_fiscal_tipo ON "movimientos"("condicion_fiscal", "tipo_movimiento");
CREATE INDEX idx_movimientos_fecha_hora ON "movimientos"("fecha_hora");
