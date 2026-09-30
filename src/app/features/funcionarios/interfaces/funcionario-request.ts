export interface FuncionarioRequest {
  nome: string;
  cpf?: string;
  email?: string;
  dataNascimento?: Date;
  endereco?: string;
  cep?: string;
  cargoId?: number;
  telefone?: string;
  dataAdmissao?: Date;
}
// String nome
// String cpf
// String email
// LocalDate dataNascimento
// String endereco
// String cep
// Long cargoId
// Long userId
// LocalDate dataAdmissao
