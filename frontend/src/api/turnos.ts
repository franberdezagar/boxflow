import { apiClient } from './client';
import type { Turno } from '../types';

interface TurnoWrap {
  mensaje?: string;
  turno: Turno;
}
interface TurnoListWrap {
  cantidad: number;
  turnos: Turno[];
}

export const turnosAPI = {
  async abrirTurno(data: { nombre_turno: string }): Promise<Turno> {
    const res = await apiClient.post<TurnoWrap>('/turnos/abrir', data);
    return res.turno;
  },

   async cerrarTurno(data: {
     turno_id: string;
     efectivo_final_blanco_declarado: number;
     efectivo_final_efectivo_declarado: number;
     notas?: string;
   }): Promise<Turno> {
     const res = await apiClient.post<TurnoWrap>('/turnos/cerrar', data);
     return res.turno;
   },

  async obtenerTurnoActivo(): Promise<Turno> {
    return apiClient.get<Turno>('/turnos/activo');
  },

  async obtenerTurno(turnoId: string): Promise<Turno> {
    return apiClient.get<Turno>(`/turnos/${turnoId}`);
  },

  async listarTurnos(): Promise<Turno[]> {
    const res = await apiClient.get<TurnoListWrap>('/turnos/listado');
    return res.turnos;
  },

   async obtenerSaldosEsperados(turnoId: string): Promise<{
     blanco_esperado: number;
     efectivo_esperado: number;
   }> {
     return apiClient.get(`/turnos/${turnoId}/saldos-esperados`);
   },
};
