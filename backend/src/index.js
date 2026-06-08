import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import { initializeModels } from './models/index.js';
import { TurnoService } from './services/TurnoService.js';
import { MovimientoService } from './services/MovimientoService.js';
import { ReporteService } from './services/ReporteService.js';
import { crearRutasTurnos } from './routes/turnos.js';
import { crearRutasMovimientos } from './routes/movimientos.js';
import { crearRutasReportes } from './routes/reportes.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

/**
 * Construye la aplicación Express completa (con DB, modelos, servicios y rutas).
 * Se memoiza para reutilizar la misma instancia entre invocaciones serverless
 * (Vercel mantiene el contenedor "caliente" entre requests).
 */
async function buildApp() {
  const app = express();

  // Seguridad
  app.use(helmet());

  // CORS: reflejar el origen de la request (el frontend y la API comparten dominio en Vercel)
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Base de datos y modelos
  await sequelize.authenticate();
  console.log('✅ Conexión a la base de datos establecida');

  const models = initializeModels(sequelize);
  console.log('✅ Modelos inicializados');

  await sequelize.sync({ alter: false });
  console.log('✅ Base de datos sincronizada');

  // Servicios
  const turnoService = new TurnoService(models);
  const movimientoService = new MovimientoService(models);
  const reporteService = new ReporteService(models);

  // Rutas API
  app.use('/api/turnos', crearRutasTurnos(turnoService));
  app.use('/api/movimientos', crearRutasMovimientos(movimientoService));
  app.use('/api/reportes', crearRutasReportes(reporteService));

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
    });
  });

  // Ruta raíz
  app.get('/', (req, res) => {
    res.json({
      nombre: 'BoxFlow API',
      version: '1.0.0',
      descripcion: 'Sistema de gestión de tesorería y caja diaria',
    });
  });

  // 404
  app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
  });

  // Manejo de errores global
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: err.message,
    });
  });

  return app;
}

// Memoización del build (lazy init, tanto en local como en serverless)
let appPromise = null;
function getApp() {
  if (!appPromise) {
    appPromise = buildApp().catch((error) => {
      // Permitir reintentar el build en la siguiente request si falló (p. ej. DB caída)
      appPromise = null;
      throw error;
    });
  }
  return appPromise;
}

// Handler compatible con Vercel (@vercel/node): recibe (req, res)
export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('❌ Error inicializando la aplicación:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Error interno del servidor',
        mensaje: error.message,
      })
    );
  }
}

// Servidor local (desarrollo): levantar listen solo fuera de producción
if (process.env.NODE_ENV !== 'production') {
  getApp()
    .then((app) => {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
        console.log(`   http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error('❌ Error inicializando la aplicación:', error);
      process.exit(1);
    });
}
