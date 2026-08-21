import { InfoCardContent } from '../../../shared/interfaces/info-card-content';

export interface ModalidadeCardContent extends InfoCardContent {
  id: number;
  totalVagas: number;
  acolhidosAtivos: number;
  ativa: boolean;
}
