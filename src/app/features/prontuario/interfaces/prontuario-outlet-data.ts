import { ProntuarioHeaderContent } from './prontuario-header-content';
import { Internacao } from '../../internacoes/interfaces/internacao';

export interface ProntuarioOutletData {
  acolhido: ProntuarioHeaderContent | null;
  internacoes: Internacao[];
  loading: boolean;
}
