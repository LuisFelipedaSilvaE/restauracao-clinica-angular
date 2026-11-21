import { StatusPagamento } from '../enums/status-pagamento';

export { StatusPagamento } from '../enums/status-pagamento';

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
