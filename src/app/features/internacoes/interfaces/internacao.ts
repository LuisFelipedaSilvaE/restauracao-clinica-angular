import { Acolhido } from '../../acolhidos/interfaces/acolhido';
import { Convenio } from '../../convenios/interfaces/convenio';
import { EtapaTratamento } from '../enums/etapa-tratamento';
import { TipoAlta } from '../enums/tipo-alta';

export interface Internacao {
  id: number;
  acolhido: Acolhido;
  convenio: Convenio;
  dataEntrada: string;
  dataSaidaPrevista: string;
  dataSaida: string | null;
  etapaTratamento: EtapaTratamento;
  valorMensalidade: number;
  ativo: boolean;
  alta: TipoAlta | null;
}
