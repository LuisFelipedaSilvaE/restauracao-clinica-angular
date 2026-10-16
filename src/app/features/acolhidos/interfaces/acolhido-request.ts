import { Endereco } from '../../../shared/interfaces/endereco';

export interface AcolhidoRequest {
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  endereco: Endereco;
  cep: string;
  telefone: string;
}
