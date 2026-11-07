export type StatusPagamento = 'CONFIRMADO' | 'ESTORNADO';

export interface Pagamento {
  id: number;
  internacaoId: number;
  valor: number;
  dataPagamento: string;
  competencia: string;
  observacao: string | null;
  status: StatusPagamento;
  dataEstorno: string | null;
  motivoEstorno: string | null;
}
