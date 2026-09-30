import { Funcionario } from './funcionario';

export interface FuncionarioCardContent extends Funcionario {
  severity: 'secondary' | 'warn' | 'success' | 'info' | 'danger' | 'contrast' | null | undefined;
}
