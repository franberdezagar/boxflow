import express from 'express';
import { MovimientoController } from '../controllers/MovimientoController.js';

// getService: (req) => MovimientoService (resuelto de forma perezosa por request)
export const crearRutasMovimientos = (getService) => {
  const router = express.Router();
  const ctrl = (req) => new MovimientoController(getService(req));

  router.post('/', (req, res) => ctrl(req).registrarMovimiento(req, res));
  router.get('/listado', (req, res) => ctrl(req).listarMovimientos(req, res));
  router.get('/turno/:turno_id', (req, res) => ctrl(req).obtenerMovimientosPorTurno(req, res));
  router.get('/:movimiento_id', (req, res) => ctrl(req).obtenerMovimientoPorId(req, res));
  router.put('/:movimiento_id', (req, res) => ctrl(req).actualizarMovimiento(req, res));
  router.delete('/:movimiento_id', (req, res) => ctrl(req).eliminarMovimiento(req, res));

  return router;
};
