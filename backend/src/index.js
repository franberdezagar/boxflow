import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import { initializeModels } from './models/index.js';
import { TurnoService } from './services/TurnoService.js';
import { MovimientoService } from './services/MovimientoService.js';
import { ReporteService } from './services/ReporteService.js';
import { ProveedorService } from './services/ProveedorService.js';
import { EmpleadoService } from './services/EmpleadoService.js';
import { crearRutasTurnos } from './routes/turnos.js';
import { crearRutasMovimientos } from './routes/movimientos.js';
import { crearRutasReportes } from './routes/reportes.js';
import { createProveedorRoutes } from './routes/proveedores.js';
import { createEmpleadoRoutes } from './routes/empleados.js';

dotenv.config();

const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// ---------------------------------------------------------------------------
// Inicialización perezosa de la base de datos (apta para serverless / pooler).
// Se ejecuta una sola vez por contenedor "caliente" y se memoriza.
// ---------------------------------------------------------------------------
let dbReady = null;

async function ensureDatabase() {
  if (!dbReady) {
    dbReady = (async () => {
      await sequelize.authenticate();
      console.log('✅ Conexión a la base de datos establecida');

      const models = initializeModels(sequelize);
      console.log('✅ Modelos inicializados');

      // Sincronizar el esquema solo si se pide explícitamente.
      // Con el Transaction Pooler de Supabase, correr sync() en cada cold start
      // puede fallar o ser lento. Hacé la migración una vez con DB_SYNC=true.
      if (process.env.DB_SYNC === 'true') {
        await sequelize.sync({ alter: false });
        console.log('✅ Base de datos sincronizada (sync)');
      }

      return {
        models,
        turnoService: new TurnoService(models),
        movimientoService: new MovimientoService(models),
        reporteService: new ReporteService(models),
      };
    })().catch((error) => {
      // Permitir reintentar en la siguiente request si falló (DB caída, etc.)
      dbReady = null;
      throw error;
    });
  }
  return dbReady;
}

// ---------------------------------------------------------------------------
// App Express (rutas montadas de forma síncrona; la DB se resuelve por request)
// ---------------------------------------------------------------------------
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (no toca la DB)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint de diagnóstico: prueba la conexión y reporta el error REAL.
app.get('/api/debug/db', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      ok: true,
      mensaje: 'Conexión a la base de datos OK',
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      nodeEnv: process.env.NODE_ENV || null,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'No se pudo conectar a la base de datos',
      error: error.message,
      name: error.name,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      nodeEnv: process.env.NODE_ENV || null,
    });
  }
});

// Ruta raíz informativa
app.get('/', (req, res) => {
  res.json({
    nombre: 'BoxFlow API',
    version: '1.0.0',
    descripcion: 'Sistema de gestión de tesorería y caja diaria',
  });
});
app.get('/api', (req, res) => {
  res.json({ nombre: 'BoxFlow API', version: '1.0.0' });
});

// Middleware: garantizar la DB antes de las rutas que la necesitan.
// Inyecta los servicios ya construidos en req.services.
app.use('/api', async (req, res, next) => {
  try {
    req.services = await ensureDatabase();
    next();
  } catch (error) {
    console.error('❌ Error de base de datos:', error);
    res.status(500).json({
      // Exponemos el error real para diagnosticar (DB: <causa>)
      error: `DB: ${error.message}`,
      name: error.name,
      mensaje: error.message,
    });
  }
});


// Rutas API. Los routers reciben un getter que toma el servicio desde req.
app.use('/api/turnos', crearRutasTurnos((req) => req.services.turnoService));
app.use('/api/movimientos', crearRutasMovimientos((req) => req.services.movimientoService));
app.use('/api/reportes', crearRutasReportes((req) => req.services.reporteService));

// Rutas para proveedores y empleados
app.use('/api/proveedores', (req, res, next) => {
  const router = createProveedorRoutes(req.services.models);
  router(req, res, next);
});

app.use('/api/empleados', (req, res, next) => {
  const router = createEmpleadoRoutes(req.services.models);
  router(req, res, next);
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: err.message,
  });
});

// Handler serverless (Vercel @vercel/node)
export default function handler(req, res) {
  return app(req, res);
}

// Servidor local (desarrollo)
if (!isProduction) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`   http://localhost:${PORT}`);
  });
}
