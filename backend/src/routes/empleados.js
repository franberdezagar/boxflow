import express from 'express';
import { EmpleadoController } from '../controllers/EmpleadoController.js';

export const createEmpleadoRoutes = (models) => {
  const router = express.Router();
  const empleadoController = new EmpleadoController(models);

  // GET /api/empleados - Listar empleados
  router.get('/', (req, res) => empleadoController.listarEmpleados(req, res));

  // GET /api/empleados/:id - Obtener empleado por ID
  router.get('/:id', (req, res) => empleadoController.obtenerEmpleado(req, res));

  // POST /api/empleados - Crear nuevo empleado
  router.post('/', (req, res) => empleadoController.crearEmpleado(req, res));

  // PUT /api/empleados/:id - Actualizar empleado
  router.put('/:id', (req, res) => empleadoController.actualizarEmpleado(req, res));

  // DELETE /api/empleados/:id - Desactivar empleado
  router.delete('/:id', (req, res) => empleadoController.eliminarEmpleado(req, res));

  // PATCH /api/empleados/:id/activar - Activar empleado
  router.patch('/:id/activar', (req, res) => empleadoController.activarEmpleado(req, res));

  return router;
};