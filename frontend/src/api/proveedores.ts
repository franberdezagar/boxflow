import { apiClient } from './client';

export interface Proveedor {
  id: string;
  razon_social: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrearProveedorData {
  razon_social: string;
  telefono?: string;
  email?: string;
  contacto?: string;
}

export interface ActualizarProveedorData extends Partial<CrearProveedorData> {
  activo?: boolean;
}

export interface FiltrosProveedor {
  activo?: boolean;
  busqueda?: string;
  limit?: number;
  offset?: number;
}

export const proveedoresApi = {
  // Listar proveedores
  listar: async (filtros: FiltrosProveedor = {}): Promise<Proveedor[]> => {
    const params = new URLSearchParams();
    
    if (filtros.activo !== undefined) {
      params.append('activo', filtros.activo.toString());
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

    return await apiClient.get<Proveedor[]>(`/proveedores?${params.toString()}`);
  },

  // Obtener proveedor por ID
  obtenerPorId: async (id: string): Promise<Proveedor> => {
    return await apiClient.get<Proveedor>(`/proveedores/${id}`);
  },

  // Crear nuevo proveedor
  crear: async (datos: CrearProveedorData): Promise<Proveedor> => {
    return await apiClient.post<Proveedor>('/proveedores', datos);
  },

  // Actualizar proveedor
  actualizar: async (id: string, datos: ActualizarProveedorData): Promise<Proveedor> => {
    return await apiClient.put<Proveedor>(`/proveedores/${id}`, datos);
  },

  // Desactivar proveedor
  eliminar: async (id: string): Promise<{ mensaje: string }> => {
    return await apiClient.delete<{ mensaje: string }>(`/proveedores/${id}`);
  },

  // Activar proveedor
  activar: async (id: string): Promise<Proveedor> => {
    return await apiClient.patch<Proveedor>(`/proveedores/${id}/activar`);
  },
};
