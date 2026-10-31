export interface InternacaoMock {
  id: number;
  idAcolhido: number;
  idConvenio: number;
  idTriagem: number | null;
  dataAdmissao: Date;
  dataPrevisaoAlta: Date;
  observacaoIsencao?: string;
  etapaTratamento: string;
}
