import { Acolhido } from '../../acolhidos/interfaces/acolhido';
import { InternacaoCardContent } from '../../internacoes/interfaces/internacao-card-content';
import { EtapaTratamentoSeverity } from '../../internacoes/interfaces/etapa-tratamento-config';

export interface ProntuarioInternacaoAtual extends InternacaoCardContent {
  etapaTratamentoLabel: string;
  severity: EtapaTratamentoSeverity;
}

export interface ProntuarioHeaderContent extends Acolhido {
  idade: number;
  internacaoAtual?: ProntuarioInternacaoAtual;
}
