import { Op } from 'sequelize';

export class EmpleadoService {
  constructor(models) {
    this.Empleado = models.Empleado;
  }

  async listarEmpleados(filtros = {}) {
    const where = {};
    
    if (filtros.activo !== undefined) {
      where.activo = filtros.activo;
    }
    
    if (filtros.rol) {
      where.rol = filtros.rol;
    }
    
    if (filtros.busqueda) {
      where.nombre_completo = {
        [Op.iLike]: `%${filtros.busqueda}%`
      };
    }

    return this.Empleado.findAll({
      where,
      order: [['nombre_completo', 'ASC']],
      limit: filtros.limit || 50,
      offset: filtros.offset || 0,
    });
  }

  async obtenerEmpleadoPorId(id) {
    const empleado = await this.Empleado.findByPk(id);
    if (!empleado) {
      throw new Error('Empleado no encontrado');
    }
    return empleado;
  }

  async crearEmpleado(datos) {
    const { nombre_completo, rol, email, telefono } = datos;
    
    // Verificar que no exista un empleado con el mismo email (si se proporciona)
    if (email) {
      const empleadoExistente = await this.Empleado.findOne({
        where: { email }
      });
      
      if (empleadoExistente) {
        throw new Error('Ya existe un empleado con ese email');
      }
    }

    return this.Empleado.create({
      nombre_completo,
      rol: rol || 'CAJERO',
      email,
      telefono,
      activo: true,
    });
  }

  async actualizarEmpleado(id, datos) {
    const empleado = await this.obtenerEmpleadoPorId(id);
    
    const { nombre_completo, rol, email, telefono, activo } = datos;
    
    // Si se está cambiando el email, verificar que no exista otro igual
    if (email && email !== empleado.email) {
      const empleadoExistente = await this.Empleado.findOne({
        where: { email }
      });
      
      if (empleadoExistente) {
        throw new Error('Ya existe un empleado con ese email');
      }
    }

    await empleado.update({
      nombre_completo: nombre_completo || empleado.nombre_completo,
      rol: rol || empleado.rol,
      email: email !== undefined ? email : empleado.email,
      telefono: telefono !== undefined ? telefono : empleado.telefono,
      activo: activo !== undefined ? activo : empleado.activo,
    });

    return empleado;
  }

  async eliminarEmpleado(id) {
    const empleado = await this.obtenerEmpleadoPorId(id);
    
    // En lugar de eliminar físicamente, marcamos como inactivo
    await empleado.update({ activo: false });
    
    return { mensaje: 'Empleado desactivado exitosamente' };
  }

  async activarEmpleado(id) {
    const empleado = await this.obtenerEmpleadoPorId(id);
    await empleado.update({ activo: true });
    return empleado;
  }
}