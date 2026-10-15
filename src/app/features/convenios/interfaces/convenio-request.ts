export interface ConvenioRequest {
  descricao: string;
  cnpj: string | null;
  maxVagas: number;
  pagamento: boolean;
  cor: string;
}
