import { Acolhido } from '../../acolhidos/interfaces/acolhido';
import { Convenio } from '../../convenios/interfaces/convenio';
import { Internacao } from './internacao';

export interface InternacaoCardContent extends Internacao {
  acolhido: Acolhido;
  convenio: Convenio;
  tempoInternado: string;
  encerrada: boolean;
  severity: 'secondary' | 'warn' | 'success' | 'info' | 'danger' | 'contrast';
}
