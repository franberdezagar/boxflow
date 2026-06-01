export class ReporteController {
  constructor(reporteService) {
    this.reporteService = reporteService;
  }

  async generarReporteDiario(req, res) {
    try {
      const { fecha } = req.query;

      if (!fecha) {
        return res.status(400).json({
          error: 'Se requiere parámetro "fecha" (YYYY-MM-DD)',
        });
      }

      const reporte = await this.reporteService.generarReporteDiario(fecha);

      res.status(200).json(reporte);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  async generarReporteSemanal(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;

      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          error: 'Se requieren parámetros "fecha_inicio" y "fecha_fin" (YYYY-MM-DD)',
        });
      }

      const reporte = await this.reporteService.generarReporteSemanal(fecha_inicio, fecha_fin);

      res.status(200).json(reporte);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  async generarReporteMensual(req, res) {
    try {
      const { año, mes } = req.query;

      if (!año || !mes) {
        return res.status(400).json({
          error: 'Se requieren parámetros "año" y "mes"',
        });
      }

      const reporte = await this.reporteService.generarReporteMensual(parseInt(año), parseInt(mes));

      res.status(200).json(reporte);
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
}
