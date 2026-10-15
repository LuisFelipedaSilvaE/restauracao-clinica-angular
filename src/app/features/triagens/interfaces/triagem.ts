import { Convenio } from '../../convenios/interfaces/convenio';

export interface Triagem {
  id: number;
  convenio: Convenio;
  nomePossivelAcolhido: string;
  telefone: string;
  dataAgendada: string;
  observacaoEntrevista: string;
  status: string;
}
