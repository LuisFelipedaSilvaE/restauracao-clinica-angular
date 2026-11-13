import { Endereco } from '../../../shared/interfaces/endereco';

export interface AcolhidoRequest {
  responsavelId: number;
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  endereco: Endereco;
  cep: string;
  telefone: string;
}
