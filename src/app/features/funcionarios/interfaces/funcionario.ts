export interface Funcionario {
  id: number;
  nome: string;
  cpf?: string;
  role?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  dataNascimento?: Date;
  ativo?: boolean;
}
