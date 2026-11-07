export interface PagamentoRequest {
  internacaoId: number;
  valor: number;
  dataPagamento: string;
  competencia: string;
  observacao: string | null;
}
