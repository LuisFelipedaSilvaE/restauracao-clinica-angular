import { Usuario } from '../../../core/guards/models/usuario.model';
import { Endereco } from '../../../shared/interfaces/endereco';
import { Cargo } from '../../cargos/interfaces/cargo';

export interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: string;
  endereco: Endereco;
  cep: string;
  telefone: string;
  ativo: boolean;
  cargo: Cargo;
  user: Usuario;
  dataAdmissao: string;
}
