import { Sequelize } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Configuración común pensada para entornos serverless (Vercel) detrás de un
// pooler de Supabase (Transaction/Session pooler en el puerto 6543).
const commonOptions = {
  dialect: 'postgres',
  // Pasar el módulo pg de forma explícita: en serverless (Vercel) la resolución
  // automática de Sequelize falla con "Please install pg package manually".
  dialectModule: pg,

  logging: isProduction ? false : console.log,
  // En serverless cada invocación es efímera: mantené el pool chico.
  pool: {
    max: 2,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    // Importante para el Transaction Pooler (PgBouncer en modo transaction):
    // no se admiten prepared statements persistentes entre transacciones.
    statement_timeout: 30000,
    // Mantener vivas las conexiones reutilizadas por el contenedor "caliente".
    keepAlive: true,
  },
  define: {
    timestamps: true,
  },
};

// Preferir DATABASE_URL (cadena del pooler de Supabase). Como fallback, usar
// variables individuales (útil en desarrollo local sin pooler).
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, commonOptions)
  : new Sequelize({
      database: process.env.DB_NAME || 'boxflow_db',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      ...commonOptions,
      // En local normalmente no hay SSL: desactivarlo si no se usa pooler.
      dialectOptions: process.env.DB_SSL === 'true' ? commonOptions.dialectOptions : {},
    });

export default sequelize;
