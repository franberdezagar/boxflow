import { apiClient } from './client';
import type { ReporteDiario, ReportePeriodo } from '../types';

export const reportesAPI = {
  async obtenerReporteDiario(fecha: string): Promise<ReporteDiario> {
    return apiClient.get(`/reportes/diario?fecha=${fecha}`);
  },

  async obtenerReporteSemanal(
    fechaInicio: string,
    fechaFin: string
  ): Promise<ReportePeriodo> {
    return apiClient.get(
      `/reportes/semanal?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
    );
  },

  async obtenerReporteMensual(
    anio: number,
    mes: number
  ): Promise<ReportePeriodo> {
    return apiClient.get(
      `/reportes/mensual?${encodeURIComponent('año')}=${anio}&mes=${mes}`
    );
  },
};
