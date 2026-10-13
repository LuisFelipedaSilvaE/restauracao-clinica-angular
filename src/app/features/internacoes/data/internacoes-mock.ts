import { ACOLHIDOS_MOCK } from '../../acolhidos/data/acolhidos-mock';
import { Internacao } from '../interfaces/internacao';

export const INTERNACOES_MOCK: Internacao[] = ACOLHIDOS_MOCK.map((acolhido) => {
  const dataPrevisaoAlta = new Date(acolhido.dataEntrada);
  dataPrevisaoAlta.setMonth(dataPrevisaoAlta.getMonth() + 3);

  return {
    id: acolhido.id,
    idAcolhido: acolhido.id,
    idModalidade: acolhido.modalidade.id,
    idTriagem: null,
    dataAdmissao: new Date(acolhido.dataEntrada),
    dataPrevisaoAlta,
    observacaoIsencao: acolhido.observacaoIsencao,
    etapaTratamento: acolhido.etapaTratamento,
  };
});
