import { Acolhido } from './acolhido';

export interface AcolhidoCardContent extends Acolhido {
  severity: 'secondary' | 'warn' | 'success' | 'info' | 'danger' | 'contrast';
  previsaoDeAlta: Date;
  tempoInternado: string;
}
