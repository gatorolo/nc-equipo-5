export interface Cliente {
  id?: number;
  nombre: string;
  empresa: string;
  avatar: string;
  estado: 'Activo' | 'Inactivo';
  ultimaInteraccion: string;
  ciudad?: string;
  email?: string;
  telefono?: string;
}

export interface PipelineStage {
  id?: number;
  nombre: string;
  color: string;
  orden: number;
}

export type EtapaTrato = string;

export interface Trato {
  id?: string;
  nombre: string;
  monto: number;
  etapa: string;
  clienteId: string;
  empresa: string;
}

export interface Kpi {
  titulo: string;
  valor: string | number;
  tendencia: number;
  icono: string;
}
