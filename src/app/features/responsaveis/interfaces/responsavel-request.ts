import { Endereco } from '../../../shared/interfaces/endereco';

export interface ResponsavelRequest {
  nome: string;
  cpf: string;
  email: string;
  endereco: Endereco;
  cep: string;
  telefone: string;
}
