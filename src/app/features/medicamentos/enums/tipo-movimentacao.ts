export enum TipoMovimentacao {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
}

export const TIPO_MOVIMENTACAO_LABELS: Record<TipoMovimentacao, string> = {
  [TipoMovimentacao.ENTRADA]: 'Entrada',
  [TipoMovimentacao.SAIDA]: 'Saída',
};
