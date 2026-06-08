// Enums
export const NombreTurno = {
  MAÑANA: 'MAÑANA',
  TARDE: 'TARDE',
} as const;

export const EstadoTurno = {
  ABIERTO: 'ABIERTO',
  CERRADO: 'CERRADO',
} as const;

export const TipoMovimiento = {
  INGRESO: 'INGRESO',
  EGRESO: 'EGRESO',
} as const;

export const Categoria = {
  VENTA: 'VENTA',
  PROVEEDOR: 'PROVEEDOR',
  SUELDO: 'SUELDO',
  VARIOS: 'VARIOS',
} as const;

export const CondicionFiscal = {
  BLANCO: 'BLANCO',
  NEGRO: 'NEGRO',
} as const;

// Interfaces
export interface Turno {
  id: string;
  nombre_turno: typeof NombreTurno[keyof typeof NombreTurno];
  fecha_apertura: string;
  fecha_cierre: string | null;
  estado: typeof EstadoTurno[keyof typeof EstadoTurno];
  efectivo_inicial_blanco: number;
  efectivo_inicial_negro: number;
  efectivo_final_blanco_esperado: number;
  efectivo_final_blanco_declarado: number | null;
  efectivo_final_negro_esperado: number;
  efectivo_final_negro_declarado: number | null;
  notas?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Movimiento {
  id: string;
  turno_id: string;
  tipo_movimiento: typeof TipoMovimiento[keyof typeof TipoMovimiento];
  categoria: typeof Categoria[keyof typeof Categoria];
  condicion_fiscal: typeof CondicionFiscal[keyof typeof CondicionFiscal];
  monto: number;
  proveedor_id?: string;
  empleado_id?: string;
  fecha_hora: string;
  descripcion: string;
  comprobante?: string;
  createdAt: string;
  updatedAt: string;
}

// Backend report shape
export interface ResumenCondicion {
  ingresos: number;
  egresos: number;
  neto: number;
}

export interface ResumenReporte {
  blanco: ResumenCondicion;
  negro: ResumenCondicion;
  total_movimientos: number;
}

export interface ReporteDiario {
  fecha: string;
  cantidad_turnos?: number;
  turnos: unknown[];
  resumen: ResumenReporte;
}

export interface ReportePeriodo {
  periodo: Record<string, unknown>;
  cantidad_turnos?: number;
  resumen: ResumenReporte;
  detalles_por_dia?: unknown[];
  detalles_por_semana?: unknown[];
}
