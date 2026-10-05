import { Usuario } from '../../../core/guards/models/usuario.model';
import { Endereco } from '../../../shared/interfaces/endereco';

export interface FuncionarioRequest {
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: Date;
  endereco: Endereco;
  cep: string;
  telefone: string;
  cargoId: number;
  dataAdmissao: Date;
  user: Usuario;
}
