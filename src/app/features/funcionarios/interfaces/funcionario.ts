import { Cargo } from '../../cargos/interfaces/cargo';

export interface Funcionario {
  id: number;
  nome: string;
  cpf?: string;
  cargo?: Cargo;
  endereco?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  dataNascimento?: Date;
  dataAdmissao?: Date;
  ativo?: boolean;
}
