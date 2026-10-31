import { TipoAlta } from '../enums/tipo-alta';

export interface InternacaoEndRequest {
  alta: TipoAlta;
  dataSaida: string;
}
