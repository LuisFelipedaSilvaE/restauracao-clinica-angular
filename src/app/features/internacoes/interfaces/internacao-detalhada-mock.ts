import { Acolhido } from '../../acolhidos/interfaces/acolhido';
import { Convenio } from '../../convenios/interfaces/convenio';
import { EtapaTratamentoSeverity } from './etapa-tratamento-config';
import { InternacaoMock } from './internacao-mock';

export interface InternacaoDetalhadaMock extends InternacaoMock {
  acolhido: Acolhido;
  convenio: Convenio;
  tempoInternado: string;
  encerrada: boolean;
  severity: EtapaTratamentoSeverity;
}
