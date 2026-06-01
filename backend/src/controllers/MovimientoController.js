export class MovimientoController {
  constructor(movimientoService) {
    this.movimientoService = movimientoService;
  }

  async registrarMovimiento(req, res) {
    try {
      const { tipo_movimiento, categoria, condicion_fiscal, monto, proveedor_id, empleado_id, descripcion, comprobante } = req.body;

      if (!tipo_movimiento || !categoria || !condicion_fiscal || !monto) {
        return res.status(400).json({
          error: 'Faltan campos requeridos',
        });
      }

      const nuevoMovimiento = await this.movimientoService.registrarMovimiento({
        tipo_movimiento,
        categoria,
        condicion_fiscal,
        monto,
        proveedor_id,
        empleado_id,
        descripcion,
        comprobante,
      });

      res.status(201).json({
        mensaje: 'Movimiento registrado correctamente',
        movimiento: nuevoMovimiento,
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  async obtenerMovimientosPorTurno(req, res) {
    try {
      const { turno_id } = req.params;

      const filtros = {
        tipo_movimiento: req.query.tipo_movimiento,
        condicion_fiscal: req.query.condicion_fiscal,
        categoria: req.query.categoria,
      };

      const movimientos = await this.movimientoService.obtenerMovimientosPorTurno(turno_id, filtros);

      res.status(200).json({
        cantidad: movimientos.length,
        movimientos,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  async obtenerMovimientoPorId(req, res) {
    try {
      const { movimiento_id } = req.params;

      const movimiento = await this.movimientoService.obtenerMovimientoPorId(movimiento_id);

      if (!movimiento) {
        return res.status(404).json({
          error: 'Movimiento no encontrado',
        });
      }

      res.status(200).json(movimiento);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  async actualizarMovimiento(req, res) {
    try {
      const { movimiento_id } = req.params;
      const datos = req.body;

      const movimientoActualizado = await this.movimientoService.actualizarMovimiento(movimiento_id, datos);

      res.status(200).json({
        mensaje: 'Movimiento actualizado correctamente',
        movimiento: movimientoActualizado,
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  async eliminarMovimiento(req, res) {
    try {
      const { movimiento_id } = req.params;

      const resultado = await this.movimientoService.eliminarMovimiento(movimiento_id);

      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  async listarMovimientos(req, res) {
    try {
      const filtros = {
        turno_id: req.query.turno_id,
        tipo_movimiento: req.query.tipo_movimiento,
        condicion_fiscal: req.query.condicion_fiscal,
        categoria: req.query.categoria,
        fecha_desde: req.query.fecha_desde,
        fecha_hasta: req.query.fecha_hasta,
        limit: req.query.limit ? parseInt(req.query.limit) : 100,
        offset: req.query.offset ? parseInt(req.query.offset) : 0,
      };

      const movimientos = await this.movimientoService.listarMovimientos(filtros);

      res.status(200).json({
        cantidad: movimientos.length,
        movimientos,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
}
