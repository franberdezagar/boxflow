import { apiClient } from './client';

export interface Empleado {
  id: string;
  nombre_completo: string;
  rol: 'CAJERO' | 'GERENTE' | 'ADMIN';
  email?: string;
  telefono?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrearEmpleadoData {
  nombre_completo: string;
  rol?: 'CAJERO' | 'GERENTE' | 'ADMIN';
  email?: string;
  telefono?: string;
}

export interface ActualizarEmpleadoData extends Partial<CrearEmpleadoData> {
  activo?: boolean;
}

export interface FiltrosEmpleado {
  activo?: boolean;
  rol?: 'CAJERO' | 'GERENTE' | 'ADMIN';
  busqueda?: string;
  limit?: number;
  offset?: number;
}

export const empleadosApi = {
  // Listar empleados
  listar: async (filtros: FiltrosEmpleado = {}): Promise<Empleado[]> => {
    const params = new URLSearchParams();
    
    if (filtros.activo !== undefined) {
      params.append('activo', filtros.activo.toString());
    }
    if (filtros.rol) {
      params.append('rol', filtros.rol);
    }
    if (filtros.busqueda) {
      params.append('busqueda', filtros.busqueda);
    }
    if (filtros.limit) {
      params.append('limit', filtros.limit.toString());
    }
    if (filtros.offset) {
      params.append('offset', filtros.offset.toString());
    }

    return await apiClient.get<Empleado[]>(`/empleados?${params.toString()}`);
  },

  // Obtener empleado por ID
  obtenerPorId: async (id: string): Promise<Empleado> => {
    return await apiClient.get<Empleado>(`/empleados/${id}`);
  },

  // Crear nuevo empleado
  crear: async (datos: CrearEmpleadoData): Promise<Empleado> => {
    return await apiClient.post<Empleado>('/empleados', datos);
  },

  // Actualizar empleado
  actualizar: async (id: string, datos: ActualizarEmpleadoData): Promise<Empleado> => {
    return await apiClient.put<Empleado>(`/empleados/${id}`, datos);
  },

  // Desactivar empleado
  eliminar: async (id: string): Promise<{ mensaje: string }> => {
    return await apiClient.delete<{ mensaje: string }>(`/empleados/${id}`);
  },

  // Activar empleado
  activar: async (id: string): Promise<Empleado> => {
    return await apiClient.patch<Empleado>(`/empleados/${id}/activar`);
  },
};