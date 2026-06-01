import express from 'express';
import { ReporteController } from '../controllers/ReporteController.js';

export const crearRutasReportes = (reporteService) => {
  const router = express.Router();
  const controller = new ReporteController(reporteService);

  router.get('/diario', (req, res) => controller.generarReporteDiario(req, res));
  router.get('/semanal', (req, res) => controller.generarReporteSemanal(req, res));
  router.get('/mensual', (req, res) => controller.generarReporteMensual(req, res));

  return router;
};
