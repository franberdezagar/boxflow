import express from 'express';
import { TurnoController } from '../controllers/TurnoController.js';

// getService: (req) => TurnoService (resuelto de forma perezosa por request)
export const crearRutasTurnos = (getService) => {
  const router = express.Router();
  const ctrl = (req) => new TurnoController(getService(req));

  router.post('/abrir', (req, res) => ctrl(req).abrirTurno(req, res));
  router.post('/cerrar', (req, res) => ctrl(req).cerrarTurno(req, res));
  router.get('/activo', (req, res) => ctrl(req).obtenerTurnoActivo(req, res));
  router.get('/listado', (req, res) => ctrl(req).listarTurnos(req, res));
  router.get('/:turno_id', (req, res) => ctrl(req).obtenerTurnoPorId(req, res));
  router.get('/:turno_id/saldos-esperados', (req, res) => ctrl(req).calcularSaldosEsperados(req, res));

  return router;
};
