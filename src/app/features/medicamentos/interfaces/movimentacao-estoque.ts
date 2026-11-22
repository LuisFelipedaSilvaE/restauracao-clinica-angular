import { TipoMovimentacao } from '../enums/tipo-movimentacao';

export interface MovimentacaoEstoque {
  id: number;
  medicamentoId: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  dataMovimentacao: string;
  usuarioResponsavel: string;
  saldoAnterior: number;
  saldoPosterior: number;
  justificativa: string;
}
