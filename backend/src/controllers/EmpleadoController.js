import { EmpleadoService } from '../services/EmpleadoService.js';

export class EmpleadoController {
  constructor(models) {
    this.empleadoService = new EmpleadoService(models);
  }

  async listarEmpleados(req, res) {
    try {
      const { activo, rol, busqueda, limit, offset } = req.query;
      
      const filtros = {
        activo: activo !== undefined ? activo === 'true' : undefined,
        rol,
        busqueda,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      };

      const empleados = await this.empleadoService.listarEmpleados(filtros);
      res.json(empleados);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerEmpleado(req, res) {
    try {
      const { id } = req.params;
      const empleado = await this.empleadoService.obtenerEmpleadoPorId(id);
      res.json(empleado);
    } catch (error) {
      if (error.message === 'Empleado no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async crearEmpleado(req, res) {
    try {
      const { nombre_completo, rol, email, telefono } = req.body;

      if (!nombre_completo) {
        return res.status(400).json({ error: 'El nombre completo es requerido' });
      }

      const empleado = await this.empleadoService.crearEmpleado({
        nombre_completo,
        rol,
        email,
        telefono,
      });

      res.status(201).json(empleado);
    } catch (error) {
      if (error.message === 'Ya existe un empleado con ese email') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async actualizarEmpleado(req, res) {
    try {
      const { id } = req.params;
      const { nombre_completo, rol, email, telefono, activo } = req.body;

      const empleado = await this.empleadoService.actualizarEmpleado(id, {
        nombre_completo,
        rol,
        email,
        telefono,
        activo,
      });

      res.json(empleado);
    } catch (error) {
      if (error.message === 'Empleado no encontrado') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Ya existe un empleado con ese email') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async eliminarEmpleado(req, res) {
    try {
      const { id } = req.params;
      const resultado = await this.empleadoService.eliminarEmpleado(id);
      res.json(resultado);
    } catch (error) {
      if (error.message === 'Empleado no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async activarEmpleado(req, res) {
    try {
      const { id } = req.params;
      const empleado = await this.empleadoService.activarEmpleado(id);
      res.json(empleado);
    } catch (error) {
      if (error.message === 'Empleado no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
}