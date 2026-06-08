import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import sequelize from './config/database.js';
import { initializeModels } from './models/index.js';
import { TurnoService } from './services/TurnoService.js';
import { MovimientoService } from './services/MovimientoService.js';
import { ReporteService } from './services/ReporteService.js';
import { crearRutasTurnos } from './routes/turnos.js';
import { crearRutasMovimientos } from './routes/movimientos.js';
import { crearRutasReportes } from './routes/reportes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());

// Configurar CORS dinámicamente
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
];

// En producción, agregar el dominio de Vercel
if (process.env.VERCEL_URL) {
  allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar base de datos y modelos
let models;

async function inicializarAplicacion() {
  try {
    // Sincronizar base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Inicializar modelos
    models = initializeModels(sequelize);
    console.log('✅ Modelos inicializados');

    // Sincronizar modelos con la BD
    await sequelize.sync({ alter: false });
    console.log('✅ Base de datos sincronizada');

    // Instanciar servicios
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

    // Manejo de errores 404
    app.use((req, res) => {
      res.status(404).json({
        error: 'Ruta no encontrada',
      });
    });

    // Manejo de errores global
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({
        error: 'Error interno del servidor',
        mensaje: err.message,
      });
    });

    // Iniciar servidor (solo en desarrollo local)
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
        console.log(`   http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    console.error('❌ Error inicializando la aplicación:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
}

// Inicializar en desarrollo local
if (process.env.NODE_ENV !== 'production') {
  inicializarAplicacion();
}

export default app;
export const handler = serverless(app);
