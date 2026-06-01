import { Op } from 'sequelize';
import { ENUM_TIPO_MOVIMIENTO, ENUM_CONDICION_FISCAL, ENUM_ESTADO_TURNO } from '../config/enums.js';

export class TurnoService {
  constructor(models) {
    this.Turno = models.Turno;
    this.Movimiento = models.Movimiento;
  }

  async obtenerTurnoActivo() {
    return this.Turno.findOne({
      where: { estado: ENUM_ESTADO_TURNO.ABIERTO },
      order: [['fecha_apertura', 'DESC']],
    });
  }

  async abrirTurno(nombre_turno, efectivo_inicial_blanco, efectivo_inicial_negro) {
    // Verificar que no haya un turno abierto
    const turnoAbierto = await this.obtenerTurnoActivo();
    if (turnoAbierto) {
      throw new Error('Ya existe un turno abierto');
    }

    const nuevoTurno = await this.Turno.create({
      nombre_turno,
      efectivo_inicial_blanco,
      efectivo_inicial_negro,
      estado: ENUM_ESTADO_TURNO.ABIERTO,
      fecha_apertura: new Date(),
    });

    return nuevoTurno;
  }

  async cerrarTurno(turno_id, efectivo_final_blanco_declarado, efectivo_final_negro_declarado, notas) {
    const turno = await this.Turno.findByPk(turno_id);

    if (!turno) {
      throw new Error('Turno no encontrado');
    }

    if (turno.estado === ENUM_ESTADO_TURNO.CERRADO) {
      throw new Error('El turno ya está cerrado');
    }

    // Calcular saldos esperados
    const { blanco_esperado, negro_esperado } = await this.calcularSaldosEsperados(turno_id);

    // Actualizar turno
    turno.fecha_cierre = new Date();
    turno.estado = ENUM_ESTADO_TURNO.CERRADO;
    turno.efectivo_final_blanco_esperado = blanco_esperado;
    turno.efectivo_final_negro_esperado = negro_esperado;
    turno.efectivo_final_blanco_declarado = efectivo_final_blanco_declarado;
    turno.efectivo_final_negro_declarado = efectivo_final_negro_declarado;
    turno.notas = notas;

    await turno.save();

    return turno;
  }

  async calcularSaldosEsperados(turno_id) {
    const turno = await this.Turno.findByPk(turno_id);

    if (!turno) {
      throw new Error('Turno no encontrado');
    }

    // Calcular para BLANCO
    const movimientosBlanco = await this.Movimiento.findAll({
      where: {
        turno_id,
        condicion_fiscal: ENUM_CONDICION_FISCAL.BLANCO,
      },
    });

    let saldoBlanco = parseFloat(turno.efectivo_inicial_blanco);
    movimientosBlanco.forEach((mov) => {
      const monto = parseFloat(mov.monto);
      if (mov.tipo_movimiento === ENUM_TIPO_MOVIMIENTO.INGRESO) {
        saldoBlanco += monto;
      } else {
        saldoBlanco -= monto;
      }
    });

    // Calcular para NEGRO
    const movimientosNegro = await this.Movimiento.findAll({
      where: {
        turno_id,
        condicion_fiscal: ENUM_CONDICION_FISCAL.NEGRO,
      },
    });

    let saldoNegro = parseFloat(turno.efectivo_inicial_negro);
    movimientosNegro.forEach((mov) => {
      const monto = parseFloat(mov.monto);
      if (mov.tipo_movimiento === ENUM_TIPO_MOVIMIENTO.INGRESO) {
        saldoNegro += monto;
      } else {
        saldoNegro -= monto;
      }
    });

    return {
      blanco_esperado: saldoBlanco,
      negro_esperado: saldoNegro,
    };
  }

  async obtenerTurnoPorId(turno_id) {
    return this.Turno.findByPk(turno_id, {
      include: {
        association: 'movimientos',
        include: [
          { association: 'proveedor', attributes: ['id', 'razon_social'] },
          { association: 'empleado', attributes: ['id', 'nombre_completo', 'rol'] },
        ],
      },
    });
  }

  async listarTurnos(filtros = {}) {
    const where = {};

    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.nombre_turno) where.nombre_turno = filtros.nombre_turno;
    if (filtros.fecha_desde || filtros.fecha_hasta) {
      where.fecha_apertura = {};
      if (filtros.fecha_desde) {
        where.fecha_apertura[Op.gte] = new Date(filtros.fecha_desde);
      }
      if (filtros.fecha_hasta) {
        where.fecha_apertura[Op.lte] = new Date(filtros.fecha_hasta);
      }
    }

    return this.Turno.findAll({
      where,
      order: [['fecha_apertura', 'DESC']],
      limit: filtros.limit || 50,
      offset: filtros.offset || 0,
    });
  }
}
