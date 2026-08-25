import { Funcionario } from './funcionario';

export interface FuncionarioCardContent extends Funcionario {
  siglaNome: string;
  severity: 'secondary' | 'warn' | 'success' | 'info' | 'danger' | 'contrast' | null | undefined;
}
