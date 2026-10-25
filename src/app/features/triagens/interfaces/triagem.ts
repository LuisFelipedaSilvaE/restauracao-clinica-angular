import { Convenio } from '../../convenios/interfaces/convenio';
import { StatusTriagem } from '../enums/status-triagem';

export interface Triagem {
  id: number;
  convenio: Convenio;
  nomePossivelAcolhido: string;
  telefone: string;
  dataAgendada: string;
  dataConclusao: string | null;
  observacaoEntrevista: string;
  status: StatusTriagem;
}
