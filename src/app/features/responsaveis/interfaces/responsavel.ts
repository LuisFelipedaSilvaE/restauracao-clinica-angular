import { Endereco } from '../../../shared/interfaces/endereco';

export interface Responsavel {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  endereco: Endereco;
  cep: string;
  telefone: string;
  ativo: boolean;
}
