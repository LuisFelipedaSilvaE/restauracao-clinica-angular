import { Acolhido } from '../../acolhidos/interfaces/acolhido';
import { Convenio } from '../../convenios/interfaces/convenio';
import { InternacaoMock } from './internacao-mock';

export interface InternacaoCardContent extends InternacaoMock {
  acolhido: Acolhido;
  convenio: Convenio;
  tempoInternado: string;
  encerrada: boolean;
  severity: 'secondary' | 'warn' | 'success' | 'info' | 'danger' | 'contrast';
}
