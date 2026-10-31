import { EtapaTratamento } from '../enums/etapa-tratamento';

export interface InternacaoFormDraft {
  triagemId: number | null;
  acolhidoId: number | null;
  convenioId: number | null;
  dataEntrada: Date | null;
  dataSaidaPrevista: Date | null;
  etapaTratamento: EtapaTratamento;
  valorMensalidade: number | null;
}
