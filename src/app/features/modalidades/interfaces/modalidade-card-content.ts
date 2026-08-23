import { InfoCardContent } from '../../../shared/interfaces/info-card-content';
import { Modalidade } from './modalidade';

export interface ModalidadeCardContent extends Modalidade {
  acolhidosAtivos: number;
}
