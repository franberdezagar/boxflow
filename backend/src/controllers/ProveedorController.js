import { ProveedorService } from '../services/ProveedorService.js';

export class ProveedorController {
  constructor(models) {
    this.proveedorService = new ProveedorService(models);
  }

  async listarProveedores(req, res) {
    try {
      const { activo, busqueda, limit, offset } = req.query;
      
      const filtros = {
        activo: activo !== undefined ? activo === 'true' : undefined,
        busqueda,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      };

      const proveedores = await this.proveedorService.listarProveedores(filtros);
      res.json(proveedores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerProveedor(req, res) {
    try {
      const { id } = req.params;
      const proveedor = await this.proveedorService.obtenerProveedorPorId(id);
      res.json(proveedor);
    } catch (error) {
      if (error.message === 'Proveedor no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async crearProveedor(req, res) {
    try {
      const { razon_social, telefono, email, contacto } = req.body;

      if (!razon_social) {
        return res.status(400).json({ error: 'La razón social es requerida' });
      }

      const proveedor = await this.proveedorService.crearProveedor({
        razon_social,
        telefono,
        email,
        contacto,
      });

      res.status(201).json(proveedor);
    } catch (error) {
      if (error.message === 'Ya existe un proveedor con esa razón social') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async actualizarProveedor(req, res) {
    try {
      const { id } = req.params;
      const { razon_social, telefono, email, contacto, activo } = req.body;

      const proveedor = await this.proveedorService.actualizarProveedor(id, {
        razon_social,
        telefono,
        email,
        contacto,
        activo,
      });

      res.json(proveedor);
    } catch (error) {
      if (error.message === 'Proveedor no encontrado') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Ya existe un proveedor con esa razón social') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async eliminarProveedor(req, res) {
    try {
      const { id } = req.params;
      const resultado = await this.proveedorService.eliminarProveedor(id);
      res.json(resultado);
    } catch (error) {
      if (error.message === 'Proveedor no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async activarProveedor(req, res) {
    try {
      const { id } = req.params;
      const proveedor = await this.proveedorService.activarProveedor(id);
      res.json(proveedor);
    } catch (error) {
      if (error.message === 'Proveedor no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}