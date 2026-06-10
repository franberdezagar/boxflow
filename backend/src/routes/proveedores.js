import express from 'express';
import { ProveedorController } from '../controllers/ProveedorController.js';

export const createProveedorRoutes = (models) => {
  const router = express.Router();
  const proveedorController = new ProveedorController(models);

  // GET /api/proveedores - Listar proveedores
  router.get('/', (req, res) => proveedorController.listarProveedores(req, res));

  // GET /api/proveedores/:id - Obtener proveedor por ID
  router.get('/:id', (req, res) => proveedorController.obtenerProveedor(req, res));

  // POST /api/proveedores - Crear nuevo proveedor
  router.post('/', (req, res) => proveedorController.crearProveedor(req, res));

  // PUT /api/proveedores/:id - Actualizar proveedor
  router.put('/:id', (req, res) => proveedorController.actualizarProveedor(req, res));

  // DELETE /api/proveedores/:id - Desactivar proveedor
  router.delete('/:id', (req, res) => proveedorController.eliminarProveedor(req, res));

  // PATCH /api/proveedores/:id/activar - Activar proveedor
  router.patch('/:id/activar', (req, res) => proveedorController.activarProveedor(req, res));

  return router;
};