import { EtapaTratamento } from '../enums/etapa-tratamento';

export interface InternacaoCreateRequest {
  acolhidoId: number;
  convenioId: number;
  dataEntrada: string;
  etapaTratamento: EtapaTratamento;
  valorMensalidade: number | null;
}
