import { Op } from 'sequelize';

export class ProveedorService {
  constructor(models) {
    this.Proveedor = models.Proveedor;
  }

  async listarProveedores(filtros = {}) {
    const where = {};
    
    if (filtros.activo !== undefined) {
      where.activo = filtros.activo;
    }
    
    if (filtros.busqueda) {
      where.razon_social = {
        [Op.iLike]: `%${filtros.busqueda}%`
      };
    }

    return this.Proveedor.findAll({
      where,
      order: [['razon_social', 'ASC']],
      limit: filtros.limit || 50,
      offset: filtros.offset || 0,
    });
  }

  async obtenerProveedorPorId(id) {
    const proveedor = await this.Proveedor.findByPk(id);
    if (!proveedor) {
      throw new Error('Proveedor no encontrado');
    }
    return proveedor;
  }

  async crearProveedor(datos) {
    const { razon_social, telefono, email, contacto } = datos;
    
    // Verificar que no exista un proveedor con la misma razón social
    const proveedorExistente = await this.Proveedor.findOne({
      where: { razon_social }
    });
    
    if (proveedorExistente) {
      throw new Error('Ya existe un proveedor con esa razón social');
    }

    return this.Proveedor.create({
      razon_social,
      telefono,
      email,
      contacto,
      activo: true,
    });
  }

  async actualizarProveedor(id, datos) {
    const proveedor = await this.obtenerProveedorPorId(id);
    
    const { razon_social, telefono, email, contacto, activo } = datos;
    
    // Si se está cambiando la razón social, verificar que no exista otra igual
    if (razon_social && razon_social !== proveedor.razon_social) {
      const proveedorExistente = await this.Proveedor.findOne({
        where: { razon_social }
      });
      
      if (proveedorExistente) {
        throw new Error('Ya existe un proveedor con esa razón social');
      }
    }

    await proveedor.update({
      razon_social: razon_social || proveedor.razon_social,
      telefono: telefono !== undefined ? telefono : proveedor.telefono,
      email: email !== undefined ? email : proveedor.email,
      contacto: contacto !== undefined ? contacto : proveedor.contacto,
      activo: activo !== undefined ? activo : proveedor.activo,
    });

    return proveedor;
  }

  async eliminarProveedor(id) {
    const proveedor = await this.obtenerProveedorPorId(id);
    
    // En lugar de eliminar físicamente, marcamos como inactivo
    await proveedor.update({ activo: false });
    
    return { mensaje: 'Proveedor desactivado exitosamente' };
  }

  async activarProveedor(id) {
    const proveedor = await this.obtenerProveedorPorId(id);
    await proveedor.update({ activo: true });
    return proveedor;
  }
}