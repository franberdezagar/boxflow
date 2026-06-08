import express from 'express';
import { ReporteController } from '../controllers/ReporteController.js';

// getService: (req) => ReporteService (resuelto de forma perezosa por request)
export const crearRutasReportes = (getService) => {
  const router = express.Router();
  const ctrl = (req) => new ReporteController(getService(req));

  router.get('/diario', (req, res) => ctrl(req).generarReporteDiario(req, res));
  router.get('/semanal', (req, res) => ctrl(req).generarReporteSemanal(req, res));
  router.get('/mensual', (req, res) => ctrl(req).generarReporteMensual(req, res));

  return router;
};
