import { Endereco } from '../../../shared/interfaces/endereco';
import { Responsavel } from '../../responsaveis/interfaces/responsavel';

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
  responsavel: Responsavel;
}
