import express from 'express';
import { TurnoController } from '../controllers/TurnoController.js';

export const crearRutasTurnos = (turnoService) => {
  const router = express.Router();
  const controller = new TurnoController(turnoService);

  router.post('/abrir', (req, res) => controller.abrirTurno(req, res));
  router.post('/cerrar', (req, res) => controller.cerrarTurno(req, res));
  router.get('/activo', (req, res) => controller.obtenerTurnoActivo(req, res));
  router.get('/listado', (req, res) => controller.listarTurnos(req, res));
  router.get('/:turno_id', (req, res) => controller.obtenerTurnoPorId(req, res));
  router.get('/:turno_id/saldos-esperados', (req, res) => controller.calcularSaldosEsperados(req, res));

  return router;
};
