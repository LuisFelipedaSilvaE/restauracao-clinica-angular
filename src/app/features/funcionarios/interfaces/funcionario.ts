import { Usuario } from '../../../core/guards/models/usuario.model';
import { Cargo } from '../../cargos/interfaces/cargo';

export interface Funcionario {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  dataNascimento: Date;
  endereco: string;
  cep: string;
  ativo: boolean;
  cargo: Cargo;
  user: Usuario;
  telefone?: string;
  dataAdmissao: Date;
}
