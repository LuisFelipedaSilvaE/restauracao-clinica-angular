import { Modalidade } from '../../modalidades/interfaces/modalidade';

export interface Acolhido {
  id: number;
  modalidade: Modalidade;
  id_triagem?: number;
  nome: string;
  cpf: string;
  cep: string;
  telefone: string;
  email: string;
  dataNascimento: Date;
  dataEntrada: Date;
  valorPagamento: number;
  oservacaoIsencao?: string;
  etapaTratamento: string;
  status: string;
}
