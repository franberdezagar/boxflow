# 🗄️ Arquitectura de Base de Datos - BoxFlow

## Diagrama Entidad-Relación (ER)

```
┌─────────────────┐
│     TURNOS      │
├─────────────────┤
│ id (PK)         │
│ nombre_turno    │
│ fecha_apertura  │
│ fecha_cierre    │
│ estado          │
│ efectivo_*      │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────▼──────────────┐
    │   MOVIMIENTOS     │
    ├───────────────────┤
    │ id (PK)           │
    │ turno_id (FK)     │◄─── ABIERTO = movimientos posibles
    │ tipo_movimiento   │     CERRADO = movimientos bloqueados
    │ categoria         │
    │ condicion_fiscal  │
    │ monto             │
    │ proveedor_id (FK) │ ┐
    │ empleado_id (FK)  │ ├─── Referencias opcionales
    │ fecha_hora        │ ┘
    └────────┬──────────┘
             │
    ┌────────┼──────────┐
    │        │          │
    ▼        ▼          ▼
┌─────────┐ ┌────────┐ ┌─────────┐
│PROVEEDOR│ │EMPLEADO│ │ (otros) │
├─────────┤ ├────────┤ ├─────────┤
│ id (PK) │ │ id(PK) │ │         │
│razon_s. │ │nombre  │ │         │
│telefono │ │rol     │ │         │
│contacto │ │activo  │ │         │
└─────────┘ └────────┘ └─────────┘
```

## Tablas y Campos

### 1. TURNOS
**Propósito:** Gestionar sesiones de operación diaria

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---|---|
| `id` | UUID | PK, AUTO | Identificador único |
| `nombre_turno` | ENUM | NOT NULL, CHECK | MAÑANA o TARDE |
| `fecha_apertura` | TIMESTAMP | NOT NULL, DEFAULT NOW | Inicio de operación |
| `fecha_cierre` | TIMESTAMP | NULL | Fin de operación (NULL si abierto) |
| `estado` | ENUM | NOT NULL, DEFAULT ABIERTO | ABIERTO o CERRADO |
| `efectivo_inicial_blanco` | NUMERIC(12,2) | NOT NULL, DEFAULT 0 | Efectivo facturado al abrir |
| `efectivo_inicial_negro` | NUMERIC(12,2) | NOT NULL, DEFAULT 0 | Efectivo informal al abrir |
| `efectivo_final_blanco_esperado` | NUMERIC(12,2) | NULL | Calculado al cerrar |
| `efectivo_final_blanco_declarado` | NUMERIC(12,2) | NULL | Reporte del cajero |
| `efectivo_final_negro_esperado` | NUMERIC(12,2) | NULL | Calculado al cerrar |
| `efectivo_final_negro_declarado` | NUMERIC(12,2) | NULL | Reporte del cajero |
| `notas` | TEXT | NULL | Observaciones del cierre |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW | Auditoría |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW | Auditoría |

**Índices:**
- `idx_turnos_estado_apertura` (estado, fecha_apertura) - Búsqueda de turno activo
- `idx_turnos_fecha_cierre` (fecha_cierre) - Reportes por rango de fechas

**Restricciones:**
- Solo puede haber UN turno ABIERTO simultáneamente (enforced en aplicación)
- Campo `fecha_cierre` NULL mientras `estado = ABIERTO`

---

### 2. MOVIMIENTOS
**Propósito:** Registrar cada transacción de caja

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---|---|
| `id` | UUID | PK, AUTO | Identificador único |
| `turno_id` | UUID | NOT NULL, FK | Referencia a turno activo |
| `tipo_movimiento` | ENUM | NOT NULL, CHECK | INGRESO o EGRESO |
| `categoria` | ENUM | NOT NULL, CHECK | VENTA, PROVEEDOR, SUELDO, VARIOS |
| `condicion_fiscal` | ENUM | NOT NULL, CHECK | BLANCO (facturado) o NEGRO (informal) |
| `monto` | NUMERIC(12,2) | NOT NULL, >0 | Cantidad movida |
| `proveedor_id` | UUID | NULL, FK | Ref. opcional a proveedor |
| `empleado_id` | UUID | NULL, FK | Ref. opcional a empleado |
| `fecha_hora` | TIMESTAMP | NOT NULL, DEFAULT NOW | Cuándo ocurrió |
| `descripcion` | TEXT | NULL | Detalles de la operación |
| `comprobante` | VARCHAR(100) | NULL | Número de recibo/factura |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW | Auditoría |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW | Auditoría |

**Índices:**
- `idx_movimientos_turno_fecha` (turno_id, fecha_hora) - Listar movimientos por turno
- `idx_movimientos_fiscal_tipo` (condicion_fiscal, tipo_movimiento) - Cálculo de saldos
- `idx_movimientos_fecha_hora` (fecha_hora) - Reportes por rango de fechas

**Restricciones:**
- `turno_id` debe referenciar un turno ABIERTO (enforced en aplicación)
- `monto` debe ser positivo
- ON DELETE CASCADE con TURNOS (cerrar turno elimina movimientos)
- ON DELETE SET NULL con PROVEEDORES y EMPLEADOS

---

### 3. PROVEEDORES
**Propósito:** Maestro de proveedores para referencia en egresos

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---|---|
| `id` | UUID | PK, AUTO | Identificador único |
| `razon_social` | VARCHAR(255) | NOT NULL, UNIQUE | Nombre del proveedor |
| `telefono` | VARCHAR(20) | NULL | Contacto |
| `email` | VARCHAR(255) | NULL | Correo electrónico |
| `contacto` | VARCHAR(255) | NULL | Persona responsable |
| `activo` | BOOLEAN | NOT NULL, DEFAULT true | Flag de estatus |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW | Auditoría |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW | Auditoría |

---

### 4. EMPLEADOS
**Propósito:** Maestro de empleados para referencias en pagos/responsables

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---|---|
| `id` | UUID | PK, AUTO | Identificador único |
| `nombre_completo` | VARCHAR(255) | NOT NULL | Nombre del empleado |
| `rol` | ENUM | NOT NULL, DEFAULT CAJERO | CAJERO, GERENTE, ADMIN |
| `email` | VARCHAR(255) | UNIQUE, NULL | Correo único |
| `telefono` | VARCHAR(20) | NULL | Contacto |
| `activo` | BOOLEAN | NOT NULL, DEFAULT true | Flag de estatus |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW | Auditoría |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW | Auditoría |

---

## Lógica de Cálculo de Saldos

### Fórmula por Condición Fiscal

```
SALDO_ESPERADO_BLANCO = 
    efectivo_inicial_blanco
  + SUM(monto WHERE condicion_fiscal=BLANCO AND tipo_movimiento=INGRESO)
  - SUM(monto WHERE condicion_fiscal=BLANCO AND tipo_movimiento=EGRESO)

SALDO_ESPERADO_NEGRO = 
    efectivo_inicial_negro
  + SUM(monto WHERE condicion_fiscal=NEGRO AND tipo_movimiento=INGRESO)
  - SUM(monto WHERE condicion_fiscal=NEGRO AND tipo_movimiento=EGRESO)
```

### Diferencia
```
DIFERENCIA = SALDO_DECLARADO - SALDO_ESPERADO
  > 0: Sobrante (dinero extra)
  < 0: Faltante (dinero faltante)
  = 0: Perfecto cierre
```

---

## Consolidación de Reportes

### Reporte Diario
Agrupa todos los turnos cuya `fecha_cierre` caiga en el día solicitado.

```sql
SELECT 
  DATE(fecha_cierre) as fecha,
  SUM(CASE WHEN condicion_fiscal='BLANCO' AND tipo='INGRESO' THEN monto ELSE 0 END) as blanco_ing,
  SUM(CASE WHEN condicion_fiscal='BLANCO' AND tipo='EGRESO' THEN monto ELSE 0 END) as blanco_egr,
  SUM(CASE WHEN condicion_fiscal='NEGRO' AND tipo='INGRESO' THEN monto ELSE 0 END) as negro_ing,
  SUM(CASE WHEN condicion_fiscal='NEGRO' AND tipo='EGRESO' THEN monto ELSE 0 END) as negro_egr
FROM turnos t
JOIN movimientos m ON t.id = m.turno_id
WHERE DATE(t.fecha_cierre) = '2024-06-01'
GROUP BY 1;
```

### Reporte Semanal
Rango de 7 días basado en `fecha_cierre` de turnos.

### Reporte Mensual
Todos los turnos cerrados dentro del mes especificado, desglosados por semana.

---

## Reglas de Integridad Implementadas

| Regla | Nivel | Implementación |
|-------|-------|---|
| Solo 1 turno ABIERTO | Aplicación | Validación en TurnoService |
| Movimientos requieren turno ABIERTO | Aplicación + BD | Foreign key + CHECK en MovimientoService |
| No editar turnos CERRADOS | Aplicación | Verificación de estado en MovimientoService |
| Montos positivos | BD + Aplicación | CHECK constraint + validación en POST |
| CASCADE DELETE turnos | BD | ON DELETE CASCADE |
| SET NULL referencias | BD | ON DELETE SET NULL para relaciones opcionales |

---

## Rendimiento y Escalabilidad

### Índices Estratégicos
- Búsqueda rápida de turno activo (estado + fecha)
- Consolidación eficiente de reportes (fecha_cierre)
- Cálculo de saldos optimizado (condicion_fiscal + tipo)

### Normalización
- Estructura 3NF respetada
- Tablas maestras separadas (Proveedores, Empleados)
- Eliminación de redundancia

### Particionamiento Futuro
Si la BD crece significativamente:
```sql
-- Particionar MOVIMIENTOS por fecha_hora (mensual)
-- Particionar TURNOS por fecha_cierre (trimestral)
```

---

## Migraciones

### Primera Ejecución
```bash
psql -U postgres -d boxflow_db -f migrations/001_initial_schema.sql
```

### Futuros Cambios
Las migraciones adicionales irán en `migrations/002_*, 003_*`, etc.

---

**Última actualización:** 2024-06-01  
**Estado:** ✅ Diseño validado  
**Próximo:** Implementación de triggers para auditoría
