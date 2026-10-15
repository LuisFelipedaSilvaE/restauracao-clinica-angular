import { Acolhido } from './acolhido';
import { Internacao } from '../../internacoes/interfaces/internacao';
import { Convenio } from '../../convenios/interfaces/convenio';

export interface AcolhidoCardContent extends Acolhido {
  internacaoAtual?: Pick<Internacao, 'id' | 'etapaTratamento'> & {
    convenio: Convenio;
  };
}
