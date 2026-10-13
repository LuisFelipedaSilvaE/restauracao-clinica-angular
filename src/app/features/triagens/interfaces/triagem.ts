import { Modalidade } from '../../modalidades/interfaces/modalidade';

export interface Triagem {
  id: number;
  modalidade: Modalidade;
  nomePossivelAcolhido: string;
  telefone: string;
  dataAgendada: string;
  observacaoEntrevista: string;
  status: string;
}
