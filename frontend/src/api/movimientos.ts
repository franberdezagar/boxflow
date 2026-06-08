import { apiClient } from './client';
import type { Movimiento } from '../types';

interface MovimientoWrap {
  mensaje?: string;
  movimiento: Movimiento;
}
interface MovimientoListWrap {
  cantidad: number;
  movimientos: Movimiento[];
}

export const movimientosAPI = {
  async crearMovimiento(data: {
    tipo_movimiento: string;
    categoria: string;
    condicion_fiscal: string;
    monto: number;
    descripcion: string;
    proveedor_id?: string;
    empleado_id?: string;
    comprobante?: string;
  }): Promise<Movimiento> {
    const res = await apiClient.post<MovimientoWrap>('/movimientos', data);
    return res.movimiento;
  },

  async listarMovimientos(): Promise<Movimiento[]> {
    const res = await apiClient.get<MovimientoListWrap>('/movimientos/listado');
    return res.movimientos;
  },

  async obtenerMovimientosPorTurno(turnoId: string): Promise<Movimiento[]> {
    const res = await apiClient.get<MovimientoListWrap>(
      `/movimientos/turno/${turnoId}`
    );
    return res.movimientos;
  },

  async obtenerMovimiento(movimientoId: string): Promise<Movimiento> {
    return apiClient.get<Movimiento>(`/movimientos/${movimientoId}`);
  },

  async actualizarMovimiento(
    movimientoId: string,
    data: Partial<Movimiento>
  ): Promise<Movimiento> {
    const res = await apiClient.put<MovimientoWrap>(
      `/movimientos/${movimientoId}`,
      data
    );
    return res.movimiento;
  },

  async eliminarMovimiento(movimientoId: string): Promise<void> {
    return apiClient.delete(`/movimientos/${movimientoId}`);
  },
};
