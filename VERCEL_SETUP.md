# Configuración de Vercel para BoxFlow (Monorepo)

## ✅ Cambios Realizados

### 1. Backend - Serverless Function
- ✅ Instalado `serverless-http` en `/backend`
- ✅ Modificado `backend/src/index.js`:
  - Importado `serverless-http`
  - Exportado handler: `export const handler = serverless(app);`
  - `app.listen()` solo se ejecuta en desarrollo local (`NODE_ENV !== 'production'`)
  - CORS configurado dinámicamente para incluir dominio de Vercel

### 2. Frontend - Static Build
- ✅ Modificado `frontend/src/api/client.ts`:
  - API URL detecta automáticamente si está en producción
  - En producción: usa rutas relativas `/api`
  - En desarrollo: usa `http://localhost:3001/api`

### 3. Configuración de Vercel
- ✅ Creado `vercel.json` en la raíz del proyecto:
  - Build para backend: `@vercel/node`
  - Build para frontend: `@vercel/static-build`
  - Routes configuradas para redirigir `/api/*` al backend

## 📋 Pasos Finales en Vercel Dashboard

### Paso 1: Configurar Root Directory
1. Ve a tu proyecto en **Vercel Dashboard**
2. Haz clic en **Settings** → **General**
3. En **Root Directory**, déjalo **vacío** (apuntará a la raíz del monorepo)
4. Haz clic en **Save**

### Paso 2: Configurar Build & Development
1. Ve a **Settings** → **Build & Development Settings**
2. Asegúrate de que:
   - **Build Command**: `npm run build` (o el comando que uses)
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`
3. Haz clic en **Save**

### Paso 3: Verificar Environment Variables
1. Ve a **Settings** → **Environment Variables**
2. Asegúrate de que todas las variables necesarias estén configuradas:
   - `DATABASE_URL` (Supabase)
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - Cualquier otra variable que uses en el backend

### Paso 4: Redeploy
1. Ve a **Deployments**
2. Haz clic en el último deployment
3. Haz clic en **Redeploy** para forzar un nuevo build con la nueva configuración

## 🔍 Verificación

Después del redeploy, verifica que:

1. **Frontend carga correctamente**: `https://tu-dominio.vercel.app`
2. **API responde**: `https://tu-dominio.vercel.app/api/health`
3. **Datos se cargan**: Verifica que los datos de Supabase aparezcan en el dashboard

## 🐛 Troubleshooting

### Si los datos no aparecen:
1. Abre **DevTools** (F12) → **Console**
2. Verifica si hay errores de CORS o conexión
3. Revisa los logs en Vercel: **Settings** → **Functions** → Ver logs

### Si el backend no responde:
1. Verifica que `vercel.json` esté en la raíz del proyecto
2. Verifica que `backend/src/index.js` exporte correctamente el handler
3. Revisa las variables de entorno en Vercel

### Si hay errores de CORS:
1. Verifica que `VERCEL_URL` esté siendo usado en el CORS del backend
2. Asegúrate de que el frontend esté usando `/api` en producción

## 📚 Estructura Final

```
boxflow/
├── backend/
│   ├── src/
│   │   └── index.js (con serverless handler)
│   └── package.json
├── frontend/
│   ├── src/
│   │   └── api/
│   │       └── client.ts (con detección automática de URL)
│   └── package.json
├── vercel.json (configuración de builds y routes)
└── VERCEL_SETUP.md (este archivo)
```

## ✨ Resultado

Tu monorepo ahora está completamente configurado para ejecutarse en Vercel:
- Backend como Serverless Function
- Frontend como Static Site
- Todo en el mismo dominio
- Datos persistentes en Supabase
