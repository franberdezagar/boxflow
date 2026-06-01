import express from 'express';
import { MovimientoController } from '../controllers/MovimientoController.js';

export const crearRutasMovimientos = (movimientoService) => {
  const router = express.Router();
  const controller = new MovimientoController(movimientoService);

  router.post('/', (req, res) => controller.registrarMovimiento(req, res));
  router.get('/listado', (req, res) => controller.listarMovimientos(req, res));
  router.get('/turno/:turno_id', (req, res) => controller.obtenerMovimientosPorTurno(req, res));
  router.get('/:movimiento_id', (req, res) => controller.obtenerMovimientoPorId(req, res));
  router.put('/:movimiento_id', (req, res) => controller.actualizarMovimiento(req, res));
  router.delete('/:movimiento_id', (req, res) => controller.eliminarMovimiento(req, res));

  return router;
};
