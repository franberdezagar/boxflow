export class TurnoController {
  constructor(turnoService) {
    this.turnoService = turnoService;
  }

  async abrirTurno(req, res) {
    try {
      const { nombre_turno } = req.body;

      if (!nombre_turno) {
        return res.status(400).json({
          error: 'Faltan campos requeridos',
        });
      }

      const nuevoTurno = await this.turnoService.abrirTurno(nombre_turno);

      res.status(201).json({
        mensaje: 'Turno abierto correctamente',
        turno: nuevoTurno,
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

   async cerrarTurno(req, res) {
     try {
       const { turno_id, efectivo_final_blanco_declarado, efectivo_final_efectivo_declarado, notas } = req.body;

       if (!turno_id || efectivo_final_blanco_declarado === undefined || efectivo_final_efectivo_declarado === undefined) {
         return res.status(400).json({
           error: 'Faltan campos requeridos',
         });
       }

       const turnoCerrado = await this.turnoService.cerrarTurno(
         turno_id,
         efectivo_final_blanco_declarado,
         efectivo_final_efectivo_declarado,
         notas
       );

       res.status(200).json({
         mensaje: 'Turno cerrado correctamente',
         turno: turnoCerrado,
       });
     } catch (error) {
       res.status(400).json({
         error: error.message,
       });
     }
   }

  async obtenerTurnoActivo(req, res) {
    try {
      const turnoActivo = await this.turnoService.obtenerTurnoActivo();

      if (!turnoActivo) {
        return res.status(404).json({
          error: 'No hay turno abierto actualmente',
        });
      }

      res.status(200).json(turnoActivo);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  async obtenerTurnoPorId(req, res) {
    try {
      const { turno_id } = req.params;

      const turno = await this.turnoService.obtenerTurnoPorId(turno_id);

      if (!turno) {
        return res.status(404).json({
          error: 'Turno no encontrado',
        });
      }

      res.status(200).json(turno);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  async listarTurnos(req, res) {
    try {
      const filtros = {
        estado: req.query.estado,
        nombre_turno: req.query.nombre_turno,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta,
        limit: req.query.limit ? parseInt(req.query.limit) : 50,
        offset: req.query.offset ? parseInt(req.query.offset) : 0,
      };

      const turnos = await this.turnoService.listarTurnos(filtros);

      res.status(200).json({
        cantidad: turnos.length,
        turnos,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  async calcularSaldosEsperados(req, res) {
    try {
      const { turno_id } = req.params;

      const saldos = await this.turnoService.calcularSaldosEsperados(turno_id);

      res.status(200).json(saldos);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
}
