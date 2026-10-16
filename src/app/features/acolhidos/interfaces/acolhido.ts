import { Endereco } from '../../../shared/interfaces/endereco';

export interface Acolhido {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  cep: string;
  endereco: Endereco;
  telefone: string;
  dataNascimento: string;
  ativo: boolean;
}
