# 📚 Documentación de Ejemplos

## Caso de Uso 1: Jornada Completa de Operación

### 1.1 Apertura del turno Mañana
```bash
curl -X POST http://localhost:3001/api/turnos/abrir \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_turno": "MAÑANA",
    "efectivo_inicial_blanco": 1000.00,
    "efectivo_inicial_negro": 500.00
  }'
```

**Respuesta:**
```json
{
  "mensaje": "Turno abierto correctamente",
  "turno": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre_turno": "MAÑANA",
    "fecha_apertura": "2024-06-01T09:00:00.000Z",
    "fecha_cierre": null,
    "estado": "ABIERTO",
    "efectivo_inicial_blanco": "1000.00",
    "efectivo_inicial_negro": "500.00"
  }
}
```

### 1.2 Registrar movimientos durante el turno

**Venta de producto (BLANCO)**
```bash
curl -X POST http://localhost:3001/api/movimientos \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_movimiento": "INGRESO",
    "categoria": "VENTA",
    "condicion_fiscal": "BLANCO",
    "monto": 250.50,
    "descripcion": "Venta mostrador - Cliente XYZ",
    "comprobante": "FACT-001"
  }'
```

**Compra a Proveedor (BLANCO)**
```bash
curl -X POST http://localhost:3001/api/movimientos \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_movimiento": "EGRESO",
    "categoria": "PROVEEDOR",
    "condicion_fiscal": "BLANCO",
    "monto": 500.00,
    "proveedor_id": "550e8400-e29b-41d4-a716-446655440001",
    "descripcion": "Compra de mercadería",
    "comprobante": "RECIB-123"
  }'
```

**Venta en Negro**
```bash
curl -X POST http://localhost:3001/api/movimientos \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_movimiento": "INGRESO",
    "categoria": "VENTA",
    "condicion_fiscal": "NEGRO",
    "monto": 100.00,
    "descripcion": "Venta sin factura"
  }'
```

**Pago de Sueldo (NEGRO)**
```bash
curl -X POST http://localhost:3001/api/movimientos \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_movimiento": "EGRESO",
    "categoria": "SUELDO",
    "condicion_fiscal": "NEGRO",
    "monto": 200.00,
    "empleado_id": "550e8400-e29b-41d4-a716-446655440002",
    "descripcion": "Anticipo de sueldo - Juan"
  }'
```

### 1.3 Consultar saldos esperados antes de cerrar
```bash
curl -X GET http://localhost:3001/api/turnos/550e8400-e29b-41d4-a716-446655440000/saldos-esperados
```

**Respuesta:**
```json
{
  "blanco_esperado": 750.50,
  "negro_esperado": 400.00
}
```

**Cálculo:**
- BLANCO esperado: 1000 (inicial) + 250.50 (venta) - 500 (proveedor) = 750.50
- NEGRO esperado: 500 (inicial) + 100 (venta) - 200 (sueldo) = 400.00

### 1.4 Cerrar turno
```bash
curl -X POST http://localhost:3001/api/turnos/cerrar \
  -H "Content-Type: application/json" \
  -d '{
    "turno_id": "550e8400-e29b-41d4-a716-446655440000",
    "efectivo_final_blanco_declarado": 750.50,
    "efectivo_final_negro_declarado": 400.00,
    "notas": "Cierre normal, cuadra perfecto"
  }'
```

**Respuesta:**
```json
{
  "mensaje": "Turno cerrado correctamente",
  "turno": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "estado": "CERRADO",
    "fecha_cierre": "2024-06-01T13:00:00.000Z",
    "efectivo_final_blanco_esperado": "750.50",
    "efectivo_final_blanco_declarado": "750.50",
    "efectivo_final_negro_esperado": "400.00",
    "efectivo_final_negro_declarado": "400.00"
  }
}
```

---

## Caso de Uso 2: Diferencias en Cierre (Faltante)

### Escenario
Se cierra el turno pero el efectivo real no coincide con lo esperado.

```bash
curl -X POST http://localhost:3001/api/turnos/cerrar \
  -H "Content-Type: application/json" \
  -d '{
    "turno_id": "550e8400-e29b-41d4-a716-446655440000",
    "efectivo_final_blanco_declarado": 730.00,
    "efectivo_final_negro_declarado": 400.00,
    "notas": "Faltante de 20.50 en sector blanco"
  }'
```

**Respuesta (con diferencias calculadas en frontend)**
```json
{
  "turno": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "efectivo_final_blanco_esperado": "750.50",
    "efectivo_final_blanco_declarado": "730.00",
    "diferencia_blanco": -20.50,
    "efectivo_final_negro_esperado": "400.00",
    "efectivo_final_negro_declarado": "400.00",
    "diferencia_negro": 0.00
  }
}
```

---

## Caso de Uso 3: Generar Reportes

### Reporte Diario
```bash
curl -X GET "http://localhost:3001/api/reportes/diario?fecha=2024-06-01"
```

**Respuesta:**
```json
{
  "fecha": "2024-06-01",
  "cantidad_turnos": 2,
  "turnos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre_turno": "MAÑANA",
      "saldo_blanco": {
        "inicial": 1000.00,
        "esperado": 750.50,
        "declarado": 750.50,
        "diferencia": 0.00
      },
      "saldo_negro": {
        "inicial": 500.00,
        "esperado": 400.00,
        "declarado": 400.00,
        "diferencia": 0.00
      }
    }
  ],
  "resumen": {
    "blanco": {
      "ingresos": 250.50,
      "egresos": 500.00,
      "neto": -249.50
    },
    "negro": {
      "ingresos": 100.00,
      "egresos": 200.00,
      "neto": -100.00
    },
    "total_movimientos": 4
  }
}
```

### Reporte Semanal
```bash
curl -X GET "http://localhost:3001/api/reportes/semanal?fecha_inicio=2024-06-01&fecha_fin=2024-06-07"
```

### Reporte Mensual
```bash
curl -X GET "http://localhost:3001/api/reportes/mensual?año=2024&mes=6"
```

---

## Caso de Uso 4: Gestión de Proveedores y Empleados

### Crear Proveedor (próxima implementación)
```bash
curl -X POST http://localhost:3001/api/proveedores \
  -H "Content-Type: application/json" \
  -d '{
    "razon_social": "Distribuidora ABC",
    "telefono": "+54-11-1234-5678",
    "email": "contacto@abc.com",
    "contacto": "Juan Pérez"
  }'
```

### Crear Empleado (próxima implementación)
```bash
curl -X POST http://localhost:3001/api/empleados \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_completo": "Carlos López",
    "rol": "CAJERO",
    "email": "carlos@empresa.com",
    "telefono": "+54-9-1234-5678"
  }'
```

---

## Filtros Disponibles

### Listar movimientos con filtros
```bash
# Por turno y condición fiscal
curl -X GET "http://localhost:3001/api/movimientos/listado?turno_id=UUID&condicion_fiscal=BLANCO"

# Por rango de fechas
curl -X GET "http://localhost:3001/api/movimientos/listado?fecha_desde=2024-06-01&fecha_hasta=2024-06-30"

# Por categoría
curl -X GET "http://localhost:3001/api/movimientos/listado?categoria=VENTA&tipo_movimiento=INGRESO"

# Con paginación
curl -X GET "http://localhost:3001/api/movimientos/listado?limit=20&offset=0"
```

### Listar turnos con filtros
```bash
# Solo turnos cerrados
curl -X GET "http://localhost:3001/api/turnos/listado?estado=CERRADO"

# Turno específico
curl -X GET "http://localhost:3001/api/turnos/listado?nombre_turno=MAÑANA"

# Rango de fechas
curl -X GET "http://localhost:3001/api/turnos/listado?fecha_desde=2024-06-01&fecha_hasta=2024-06-30"
```

---

## Errores Comunes

### Error: No hay turno abierto
```json
{
  "error": "No hay un turno abierto actualmente"
}
```
**Solución:** Abrir un turno primero con POST /api/turnos/abrir

### Error: Turno ya abierto
```json
{
  "error": "Ya existe un turno abierto"
}
```
**Solución:** Cerrar el turno actual antes de abrir uno nuevo

### Error: No se pueden modificar turnos cerrados
```json
{
  "error": "No se pueden modificar movimientos de turnos cerrados"
}
```
**Solución:** Los turnos cerrados son inmutables; registrar movimientos en turno abierto

---

Este documento proporciona ejemplos prácticos de uso del sistema BoxFlow.
