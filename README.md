# 📊 BoxFlow - Sistema de Gestión de Tesorería

Sistema integral para la gestión de tesorería y caja diaria en comercios locales con soporte para **Turnos Manuales** (Mañana/Tarde) y **Bimoneda Fiscal Interna** (BLANCO/NEGRO).

## 🎯 Características Principales

✅ **Control de Turnos Manuales** - Abrir/cerrar turnos Mañana y Tarde  
✅ **Bimoneda Fiscal** - Registro independiente de movimientos BLANCO y NEGRO  
✅ **Cálculo Automático de Saldos** - Sistema cierre con validación de cajas  
✅ **Reportes Consolidados** - Diarios, semanales y mensuales  
✅ **API RESTful Completa** - Endpoints para todos los procesos  
✅ **Base de Datos Relacional** - PostgreSQL con integridad referencial  
✅ **Validación de Negocio** - Reglas críticas implementadas en backend  

## 📁 Estructura del Proyecto

```
boxflow/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── config/             # Configuraciones de BD y enums
│   │   ├── models/             # Modelos Sequelize (Turno, Movimiento, etc)
│   │   ├── services/           # Lógica de negocio (Turnos, Movimientos, Reportes)
│   │   ├── controllers/        # Controladores HTTP
│   │   ├── routes/             # Rutas API
│   │   └── index.js            # Punto de entrada
│   ├── migrations/             # Scripts SQL
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── frontend/                   # React + TypeScript (próximamente)
├── docs/                       # Documentación adicional
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Requisitos
- Node.js 16+
- PostgreSQL 12+
- npm/yarn

### Instalación

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con credenciales PostgreSQL
npm run dev
```

2. **Crear Base de Datos**
```bash
psql -U postgres -c "CREATE DATABASE boxflow_db;"
```

El servidor estará en `http://localhost:3001`

## ☁️ Despliegue en Vercel

El proyecto es un **monorepo** que se despliega como una sola app en Vercel:
el **frontend** (Vite/React) como sitio estático y el **backend** (Express)
como **función serverless** en `/api`.

### Configuración del proyecto en Vercel

El archivo `vercel.json` ya deja todo configurado. En el panel de Vercel
(Settings → Build and Deployment) asegurate de tener:

- **Root Directory**: `./` (la raíz del repo, **no** `frontend`)
- **Framework Preset**: `Other` (o dejá que `vercel.json` lo controle)
- **Build / Output / Install Command**: dejá los **Override desactivados**;
  se toman desde `vercel.json`:
  - Build: `npm install --prefix frontend && npm run build --prefix frontend`
  - Output: `frontend/dist`
  - Install: `npm install` (instala las deps del backend en la raíz para la función `/api`)

> ⚠️ La causa de que "no anduvieran los botones ni la DB" era que Vercel solo
> compilaba el frontend y el backend nunca se desplegaba como API. Ahora la
> función `api/index.js` expone el Express completo bajo `/api/*`.

### Variables de entorno (Settings → Environment Variables)

| Variable | Valor | Notas |
|----------|-------|-------|
| `NODE_ENV` | `production` | |
| `DATABASE_URL` | `postgres://...` (cadena de Supabase/Postgres) | **Requerida** para que conecte la DB |

- **No** definas `VITE_API_URL` en producción: el frontend usa el mismo dominio.
- Tras cambiar variables, hacé **Redeploy**.

### Endpoints en producción

- App: `https://<tu-deploy>.vercel.app`
- API: `https://<tu-deploy>.vercel.app/api/...` (ej: `/api/turnos/activo`, `/health`)

## 📚 Documentación


- [Backend API Documentation](./backend/README.md) - Endpoints, modelos, ejemplos de uso
- [Database Schema](./backend/migrations/) - Scripts SQL
- [API Postman Collection](./docs/) - Colección de pruebas (próximamente)

## 🗄️ Modelo de Datos Principal

### Entidad: **Turnos**
Cada turno representa una sesión de caja (Mañana o Tarde) con:
- Efectivo inicial por condición fiscal (BLANCO/NEGRO)
- Cálculo automático de saldos esperados
- Declaración de saldos reales
- Generación de diferencias/ajustes

### Entidad: **Movimientos**
Cada transacción registra:
- Tipo (INGRESO/EGRESO)
- Categoría (VENTA/PROVEEDOR/SUELDO/VARIOS)
- Condición Fiscal (BLANCO/NEGRO)
- Referencias a Proveedor/Empleado si aplica

### Reportes Automatizados
- **Diarios**: Consolidación por fecha de cierre
- **Semanales**: Agrupación por rango de fechas
- **Mensuales**: Desglose por semana dentro del mes

## 🔄 Flujo de Negocio Típico

```
1. ABRIR TURNO (Mañana)
   ↓ (efectivo inicial blanco + negro)
   
2. REGISTRAR MOVIMIENTOS
   ├─ Venta Blanca (INGRESO)
   ├─ Pago Proveedor (EGRESO)
   ├─ Sueldo (EGRESO)
   └─ Otros movimientos...
   
3. CALCULAR SALDOS ESPERADOS (automático)
   ↓ (ingresos - egresos + inicial)
   
4. CERRAR TURNO
   ├─ Declarar saldos reales
   ├─ Sistema detecta diferencias
   └─ Turno pasa a CERRADO
   
5. GENERAR REPORTES
   └─ Consolidación para el día
```

## 📡 API Endpoints Principales

```
TURNOS
  POST   /api/turnos/abrir
  POST   /api/turnos/cerrar
  GET    /api/turnos/activo
  GET    /api/turnos/:id
  GET    /api/turnos/listado

MOVIMIENTOS
  POST   /api/movimientos
  GET    /api/movimientos/listado
  GET    /api/movimientos/:id
  PUT    /api/movimientos/:id
  DELETE /api/movimientos/:id

REPORTES
  GET    /api/reportes/diario
  GET    /api/reportes/semanal
  GET    /api/reportes/mensual
```

Ver [Backend README](./backend/README.md) para detalles completos.

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js 16+, Express 4 |
| ORM | Sequelize 6 |
| Database | PostgreSQL 12+ |
| Frontend | React 18, TypeScript (próximamente) |
| Server | HTTP nativo |

## 📋 Reglas de Negocio Implementadas

✔️ No se pueden registrar movimientos sin turno abierto  
✔️ Los turnos cerrados son inmutables (no se pueden editar/eliminar movimientos)  
✔️ El cierre calcula automáticamente saldos esperados  
✔️ Sistema detecta diferencias entre esperado y declarado  
✔️ Reportes consolidan múltiples turnos por fecha de cierre  

## 🔐 Seguridad

- Validación de datos en backend
- Constraint de integridad en BD
- CORS configurado
- Helmet para headers de seguridad
- Input sanitización

