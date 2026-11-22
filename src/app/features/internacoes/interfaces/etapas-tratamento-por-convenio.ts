export interface EtapasTratamentoPorConvenio {
  convenioId: number;
  descricao: string;
  quantidadeEmTratamento: number;
  quantidadeProximoAlta: number;
  quantidadeAltaVencida: number;
  quantidadeAltaConcedida: number;
  total: number;
}
