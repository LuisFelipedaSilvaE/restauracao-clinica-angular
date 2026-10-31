import { EtapaTratamento } from '../enums/etapa-tratamento';

export interface InternacaoUpdateRequest {
  dataSaidaPrevista: string;
  etapaTratamento: EtapaTratamento;
  valorMensalidade: number;
}
