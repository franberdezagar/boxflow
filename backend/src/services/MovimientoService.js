import { Op } from 'sequelize';
import { ENUM_ESTADO_TURNO, ENUM_TIPO_MOVIMIENTO, ENUM_CONDICION_FISCAL } from '../config/enums.js';

export class MovimientoService {
  constructor(models) {
    this.Movimiento = models.Movimiento;
    this.Turno = models.Turno;
  }

  async registrarMovimiento(datos) {
    // Validar que exista un turno abierto
    const turnoAbierto = await this.Turno.findOne({
      where: { estado: ENUM_ESTADO_TURNO.ABIERTO },
    });

    if (!turnoAbierto) {
      throw new Error('No hay un turno abierto actualmente');
    }

    // Validar montos positivos
    if (parseFloat(datos.monto) <= 0) {
      throw new Error('El monto debe ser positivo');
    }

    const nuevoMovimiento = await this.Movimiento.create({
      turno_id: turnoAbierto.id,
      tipo_movimiento: datos.tipo_movimiento,
      categoria: datos.categoria,
      condicion_fiscal: datos.condicion_fiscal,
      monto: datos.monto,
      proveedor_id: datos.proveedor_id || null,
      empleado_id: datos.empleado_id || null,
      fecha_hora: datos.fecha_hora || new Date(),
      descripcion: datos.descripcion || null,
      comprobante: datos.comprobante || null,
    });

    return nuevoMovimiento;
  }

  async obtenerMovimientosPorTurno(turno_id, filtros = {}) {
    const where = { turno_id };

    if (filtros.tipo_movimiento) where.tipo_movimiento = filtros.tipo_movimiento;
    if (filtros.condicion_fiscal) where.condicion_fiscal = filtros.condicion_fiscal;
    if (filtros.categoria) where.categoria = filtros.categoria;

    return this.Movimiento.findAll({
      where,
      include: [
        { association: 'proveedor', attributes: ['id', 'razon_social'] },
        { association: 'empleado', attributes: ['id', 'nombre_completo', 'rol'] },
      ],
      order: [['fecha_hora', 'DESC']],
    });
  }

  async obtenerMovimientoPorId(movimiento_id) {
    return this.Movimiento.findByPk(movimiento_id, {
      include: [
        { association: 'proveedor', attributes: ['id', 'razon_social'] },
        { association: 'empleado', attributes: ['id', 'nombre_completo', 'rol'] },
        { association: 'turno', attributes: ['id', 'nombre_turno', 'estado'] },
      ],
    });
  }

  async actualizarMovimiento(movimiento_id, datos) {
    const movimiento = await this.Movimiento.findByPk(movimiento_id);

    if (!movimiento) {
      throw new Error('Movimiento no encontrado');
    }

    // Validar que el turno siga abierto
    const turno = await this.Turno.findByPk(movimiento.turno_id);
    if (turno.estado === ENUM_ESTADO_TURNO.CERRADO) {
      throw new Error('No se pueden modificar movimientos de turnos cerrados');
    }

    await movimiento.update(datos);
    return movimiento;
  }

  async eliminarMovimiento(movimiento_id) {
    const movimiento = await this.Movimiento.findByPk(movimiento_id);

    if (!movimiento) {
      throw new Error('Movimiento no encontrado');
    }

    // Validar que el turno siga abierto
    const turno = await this.Turno.findByPk(movimiento.turno_id);
    if (turno.estado === ENUM_ESTADO_TURNO.CERRADO) {
      throw new Error('No se pueden eliminar movimientos de turnos cerrados');
    }

    await movimiento.destroy();
    return { mensaje: 'Movimiento eliminado correctamente' };
  }

  async listarMovimientos(filtros = {}) {
    const where = {};

    if (filtros.turno_id) where.turno_id = filtros.turno_id;
    if (filtros.tipo_movimiento) where.tipo_movimiento = filtros.tipo_movimiento;
    if (filtros.condicion_fiscal) where.condicion_fiscal = filtros.condicion_fiscal;
    if (filtros.categoria) where.categoria = filtros.categoria;

    if (filtros.fecha_desde || filtros.fecha_hasta) {
      where.fecha_hora = {};
      if (filtros.fecha_desde) {
        where.fecha_hora[Op.gte] = new Date(filtros.fecha_desde);
      }
      if (filtros.fecha_hasta) {
        where.fecha_hora[Op.lte] = new Date(filtros.fecha_hasta);
      }
    }

    return this.Movimiento.findAll({
      where,
      include: [
        { association: 'turno', attributes: ['id', 'nombre_turno'] },
        { association: 'proveedor', attributes: ['id', 'razon_social'] },
        { association: 'empleado', attributes: ['id', 'nombre_completo'] },
      ],
      order: [['fecha_hora', 'DESC']],
      limit: filtros.limit || 100,
      offset: filtros.offset || 0,
    });
  }
}
