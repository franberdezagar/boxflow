import { Op } from 'sequelize';
import { ENUM_TIPO_MOVIMIENTO, ENUM_CONDICION_FISCAL } from '../config/enums.js';

export class ReporteService {
  constructor(models) {
    this.Turno = models.Turno;
    this.Movimiento = models.Movimiento;
  }

  async generarReporteDiario(fecha) {
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);

    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const turnos = await this.Turno.findAll({
      where: {
        fecha_cierre: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      include: {
        association: 'movimientos',
      },
    });

    if (turnos.length === 0) {
      return {
        fecha,
        turnos: [],
        resumen: this.generarResumenVacio(),
      };
    }

    const resumen = this.calcularResumenPorDia(turnos);

    return {
      fecha,
      cantidad_turnos: turnos.length,
       turnos: turnos.map((t) => ({
         id: t.id,
         nombre_turno: t.nombre_turno,
         fecha_apertura: t.fecha_apertura,
         fecha_cierre: t.fecha_cierre,
         saldo_blanco: {
           inicial: t.efectivo_inicial_blanco,
           esperado: t.efectivo_final_blanco_esperado,
           declarado: t.efectivo_final_blanco_declarado,
           diferencia: t.efectivo_final_blanco_declarado - t.efectivo_final_blanco_esperado,
         },
         saldo_efectivo: {
           inicial: t.efectivo_inicial_efectivo,
           esperado: t.efectivo_final_efectivo_esperado,
           declarado: t.efectivo_final_efectivo_declarado,
           diferencia: t.efectivo_final_efectivo_declarado - t.efectivo_final_efectivo_esperado,
         },
       })),
      resumen,
    };
  }

  async generarReporteSemanal(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);

    const turnos = await this.Turno.findAll({
      where: {
        fecha_cierre: {
          [Op.between]: [inicio, fin],
        },
      },
      include: {
        association: 'movimientos',
      },
    });

    if (turnos.length === 0) {
      return {
        periodo: { desde: fechaInicio, hasta: fechaFin },
        turnos: [],
        resumen: this.generarResumenVacio(),
      };
    }

    const resumen = this.calcularResumenPorPeriodo(turnos);

    return {
      periodo: { desde: fechaInicio, hasta: fechaFin },
      cantidad_turnos: turnos.length,
      resumen,
      detalles_por_dia: this.agruparPorDia(turnos),
    };
  }

  async generarReporteMensual(año, mes) {
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0);

    fechaFin.setHours(23, 59, 59, 999);

    const turnos = await this.Turno.findAll({
      where: {
        fecha_cierre: {
          [Op.between]: [fechaInicio, fechaFin],
        },
      },
      include: {
        association: 'movimientos',
      },
    });

    if (turnos.length === 0) {
      return {
        periodo: { año, mes },
        turnos: [],
        resumen: this.generarResumenVacio(),
      };
    }

    const resumen = this.calcularResumenPorPeriodo(turnos);

    return {
      periodo: { año, mes },
      cantidad_turnos: turnos.length,
      resumen,
      detalles_por_semana: this.agruparPorSemana(turnos),
    };
  }

   calcularResumenPorDia(turnos) {
     let totalBlancoIngresos = 0;
     let totalBlancoEgresos = 0;
     let totalEfectivoBlancoIngresos = 0;
     let totalEfectivoBlancoEgresos = 0;
     let totalEfectivoNegroIngresos = 0;
     let totalEfectivoNegroEgresos = 0;

     turnos.forEach((turno) => {
       turno.movimientos.forEach((mov) => {
         const monto = parseFloat(mov.monto);
         if (mov.condicion_fiscal === ENUM_CONDICION_FISCAL.BLANCO) {
           if (mov.tipo_movimiento === ENUM_TIPO_MOVIMIENTO.INGRESO) {
             totalBlancoIngresos += monto;
           } else {
             totalBlancoEgresos += monto;
           }
         } else if (mov.condicion_fiscal === ENUM_CONDICION_FISCAL.EFECTIVO_BLANCO) {
           if (mov.tipo_movimiento === ENUM_TIPO_MOVIMIENTO.INGRESO) {
             totalEfectivoBlancoIngresos += monto;
           } else {
             totalEfectivoBlancoEgresos += monto;
           }
         } else if (mov.condicion_fiscal === ENUM_CONDICION_FISCAL.EFECTIVO_NEGRO) {
           if (mov.tipo_movimiento === ENUM_TIPO_MOVIMIENTO.INGRESO) {
             totalEfectivoNegroIngresos += monto;
           } else {
             totalEfectivoNegroEgresos += monto;
           }
         }
       });
     });

     return {
       blanco: {
         ingresos: totalBlancoIngresos,
         egresos: totalBlancoEgresos,
         neto: totalBlancoIngresos - totalBlancoEgresos,
       },
       efectivo_blanco: {
         ingresos: totalEfectivoBlancoIngresos,
         egresos: totalEfectivoBlancoEgresos,
         neto: totalEfectivoBlancoIngresos - totalEfectivoBlancoEgresos,
       },
       efectivo_negro: {
         ingresos: totalEfectivoNegroIngresos,
         egresos: totalEfectivoNegroEgresos,
         neto: totalEfectivoNegroIngresos - totalEfectivoNegroEgresos,
       },
       total_movimientos: turnos.reduce((acc, t) => acc + t.movimientos.length, 0),
     };
   }

  calcularResumenPorPeriodo(turnos) {
    return this.calcularResumenPorDia(turnos);
  }

  agruparPorDia(turnos) {
    const porDia = {};

    turnos.forEach((turno) => {
      const fecha = turno.fecha_cierre.toISOString().split('T')[0];
      if (!porDia[fecha]) {
        porDia[fecha] = [];
      }
      porDia[fecha].push(turno);
    });

    return Object.entries(porDia).map(([fecha, turnosDia]) => ({
      fecha,
      cantidad_turnos: turnosDia.length,
      resumen: this.calcularResumenPorDia(turnosDia),
    }));
  }

  agruparPorSemana(turnos) {
    const porSemana = {};

    turnos.forEach((turno) => {
      const fecha = new Date(turno.fecha_cierre);
      const semana = this.obtenerNumeroSemana(fecha);
      const clave = `${fecha.getFullYear()}-W${semana}`;

      if (!porSemana[clave]) {
        porSemana[clave] = [];
      }
      porSemana[clave].push(turno);
    });

    return Object.entries(porSemana).map(([semana, turnosSemana]) => ({
      semana,
      cantidad_turnos: turnosSemana.length,
      resumen: this.calcularResumenPorDia(turnosSemana),
    }));
  }

  obtenerNumeroSemana(fecha) {
    const primeroEnero = new Date(fecha.getFullYear(), 0, 1);
    const diasTranscurridos = Math.floor((fecha - primeroEnero) / 86400000);
    return Math.ceil((diasTranscurridos + primeroEnero.getDay() + 1) / 7);
  }

  generarResumenVacio() {
    return {
      blanco: {
        ingresos: 0,
        egresos: 0,
        neto: 0,
      },
      efectivo_blanco: {
        ingresos: 0,
        egresos: 0,
        neto: 0,
      },
      efectivo_negro: {
        ingresos: 0,
        egresos: 0,
        neto: 0,
      },
      total_movimientos: 0,
    };
  }
}
