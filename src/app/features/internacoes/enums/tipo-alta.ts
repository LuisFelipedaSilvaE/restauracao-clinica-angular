export enum TipoAlta {
  DESISTENCIA = 'DESISTENCIA',
  CONCLUSAO = 'CONCLUSAO',
  DESLIGAMENTO = 'DESLIGAMENTO',
  OBITO = 'OBITO',
}

export const TIPO_ALTA_LABELS: Record<TipoAlta, string> = {
  [TipoAlta.DESISTENCIA]: 'Desistência',
  [TipoAlta.CONCLUSAO]: 'Conclusão',
  [TipoAlta.DESLIGAMENTO]: 'Desligamento',
  [TipoAlta.OBITO]: 'Óbito',
};
