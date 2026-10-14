import { Acolhido } from '../../acolhidos/interfaces/acolhido';
import { Modalidade } from '../../modalidades/interfaces/modalidade';
import { Internacao } from './internacao';

export interface InternacaoCardContent extends Internacao {
  acolhido: Acolhido;
  modalidade: Modalidade;
  tempoInternado: string;
  encerrada: boolean;
  severity: 'secondary' | 'warn' | 'success' | 'info' | 'danger' | 'contrast';
}
