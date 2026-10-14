import { Acolhido } from './acolhido';
import { Internacao } from '../../internacoes/interfaces/internacao';
import { Modalidade } from '../../modalidades/interfaces/modalidade';

export interface AcolhidoCardContent extends Acolhido {
  internacaoAtual?: Pick<Internacao, 'id' | 'etapaTratamento'> & {
    modalidade: Modalidade;
  };
}
