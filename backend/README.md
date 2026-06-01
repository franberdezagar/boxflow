# 📊 BoxFlow - Sistema de Gestión de Tesorería y Caja Diaria

Sistema moderno para la gestión de tesorería, control de turnos manuales (Mañana/Tarde) y movimientos de caja con soporte para bimoneda fiscal interna (BLANCO/NEGRO).

## 🏗️ Estructura del Proyecto

```
boxflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js         # Configuración de Sequelize
│   │   │   └── enums.js            # Enumeraciones del sistema
│   │   ├── models/
│   │   │   ├── Turno.js            # Modelo de turnos
│   │   │   ├── Proveedor.js        # Modelo de proveedores
│   │   │   ├── Empleado.js         # Modelo de empleados
│   │   │   ├── Movimiento.js       # Modelo de movimientos
│   │   │   └── index.js            # Inicialización de modelos
│   │   ├── services/
│   │   │   ├── TurnoService.js     # Lógica de turnos
│   │   │   ├── MovimientoService.js # Lógica de movimientos
│   │   │   └── ReporteService.js   # Generación de reportes
│   │   ├── controllers/
│   │   │   ├── TurnoController.js      # Endpoints de turnos
│   │   │   ├── MovimientoController.js # Endpoints de movimientos
│   │   │   └── ReporteController.js    # Endpoints de reportes
│   │   ├── routes/
│   │   │   ├── turnos.js           # Rutas de turnos
│   │   │   ├── movimientos.js      # Rutas de movimientos
│   │   │   └── reportes.js         # Rutas de reportes
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── index.js                # Punto de entrada de la aplicación
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Script SQL inicial
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/
├── docs/
└── .git/
```

## 🗄️ Modelo de Datos

### **Turnos**
Gestiona los turnos de operación (Mañana/Tarde) con control de efectivo inicial y final.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `nombre_turno` | ENUM(MAÑANA, TARDE) | Turno del día |
| `fecha_apertura` | TIMESTAMP | Inicio del turno |
| `fecha_cierre` | TIMESTAMP | Cierre del turno (nullable) |
| `estado` | ENUM(ABIERTO, CERRADO) | Estado actual |
| `efectivo_inicial_blanco` | DECIMAL(12,2) | Efectivo inicial (facturado) |
| `efectivo_inicial_negro` | DECIMAL(12,2) | Efectivo inicial (no facturado) |
| `efectivo_final_blanco_esperado` | DECIMAL(12,2) | Saldo calculado |
| `efectivo_final_blanco_declarado` | DECIMAL(12,2) | Saldo real declarado |
| Similar para NEGRO | | |

### **Movimientos**
Registra cada transacción de caja con clasificación fiscal y de tipo.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `turno_id` | FK | Turno asociado |
| `tipo_movimiento` | ENUM(INGRESO, EGRESO) | Naturaleza |
| `categoria` | ENUM(VENTA, PROVEEDOR, SUELDO, VARIOS) | Clasificación |
| `condicion_fiscal` | ENUM(BLANCO, NEGRO) | Fiscal o informal |
| `monto` | DECIMAL(12,2) | Cantidad |
| `proveedor_id` | FK | Proveedor (nullable) |
| `empleado_id` | FK | Empleado responsable (nullable) |
| `fecha_hora` | TIMESTAMP | Cuándo ocurrió |
| `descripcion` | TEXT | Detalles |
| `comprobante` | VARCHAR | Referencia de comprobante |

### **Proveedores & Empleados**
Entidades maestras para referencias en movimientos.

## 🚀 Instalación y Setup

### Requisitos
- Node.js 16+
- PostgreSQL 12+
- npm o yarn

### Pasos

1. **Clonar y configurar**
```bash
cd backend
npm install
cp .env.example .env
```

2. **Configurar base de datos en `.env`**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boxflow_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña
```

3. **Ejecutar servidor**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## 📡 API Endpoints

### Turnos
- `POST /api/turnos/abrir` - Abrir nuevo turno
- `POST /api/turnos/cerrar` - Cerrar turno activo
- `GET /api/turnos/activo` - Obtener turno en curso
- `GET /api/turnos/:turno_id` - Obtener turno con movimientos
- `GET /api/turnos/listado` - Listar todos los turnos
- `GET /api/turnos/:turno_id/saldos-esperados` - Calcular saldos

### Movimientos
- `POST /api/movimientos` - Registrar movimiento
- `GET /api/movimientos/listado` - Listar movimientos
- `GET /api/movimientos/turno/:turno_id` - Movimientos por turno
- `GET /api/movimientos/:movimiento_id` - Obtener movimiento
- `PUT /api/movimientos/:movimiento_id` - Actualizar movimiento
- `DELETE /api/movimientos/:movimiento_id` - Eliminar movimiento

### Reportes
- `GET /api/reportes/diario?fecha=YYYY-MM-DD` - Reporte diario
- `GET /api/reportes/semanal?fecha_inicio=...&fecha_fin=...` - Reporte semanal
- `GET /api/reportes/mensual?año=YYYY&mes=MM` - Reporte mensual

## 🔐 Reglas de Negocio Críticas

1. **Sin turno activo, sin movimientos**: Todos los movimientos requieren un turno en estado ABIERTO
2. **Cierre automático de saldos**: Al cerrar turno, se calcula el saldo esperado por condición fiscal
3. **Reportes consolidados**: Agregan datos por rango de fechas de cierre
4. **Inmutabilidad de turnos cerrados**: No se pueden modificar movimientos de turnos ya cerrados

## 💾 Base de Datos

Ejecutar SQL inicial:
```bash
psql -U postgres -d boxflow_db -f migrations/001_initial_schema.sql
```

## 📝 Ejemplo de Uso

### Abrir un turno
```json
POST /api/turnos/abrir
{
  "nombre_turno": "MAÑANA",
  "efectivo_inicial_blanco": 1000.00,
  "efectivo_inicial_negro": 500.00
}
```

### Registrar una venta blanca
```json
POST /api/movimientos
{
  "tipo_movimiento": "INGRESO",
  "categoria": "VENTA",
  "condicion_fiscal": "BLANCO",
  "monto": 150.50,
  "descripcion": "Venta mostrador"
}
```

### Registrar un pago a proveedor
```json
POST /api/movimientos
{
  "tipo_movimiento": "EGRESO",
  "categoria": "PROVEEDOR",
  "condicion_fiscal": "BLANCO",
  "monto": 300.00,
  "proveedor_id": "uuid-proveedor"
}
```

### Cerrar turno
```json
POST /api/turnos/cerrar
{
  "turno_id": "uuid-turno",
  "efectivo_final_blanco_declarado": 1150.50,
  "efectivo_final_negro_declarado": 500.00,
  "notas": "Cierre normal"
}
```

### Generar reporte diario
```
GET /api/reportes/diario?fecha=2024-06-01
```

## 🛠️ Stack Tecnológico

- **Backend**: Node.js + Express
- **ORM**: Sequelize
- **Base de Datos**: PostgreSQL
- **Frontend**: React + TypeScript (próximamente)
- **Validación**: Middleware nativo

## 📄 Licencia

ISC

---
**Desarrollado para BoxFlow© - Buenos Aires, Argentina**
