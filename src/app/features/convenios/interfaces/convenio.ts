export interface Convenio {
  id: number;
  descricao: string;
  cnpj: string | null;
  maxVagas: number;
  ativo: boolean;
  pagamento: boolean;
  cor: string;
}
