import { Acolhido } from '../../acolhidos/interfaces/acolhido';
import { InternacaoCardContent } from '../../internacoes/interfaces/internacao-card-content';

export interface ProntuarioInternacaoAtual extends InternacaoCardContent {
  tempoInternado: string;
}

export interface ProntuarioHeaderContent extends Acolhido {
  idade: number;
  internacaoAtual?: ProntuarioInternacaoAtual;
}
