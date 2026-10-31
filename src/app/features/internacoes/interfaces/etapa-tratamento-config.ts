import { EtapaTratamento } from '../enums/etapa-tratamento';

export type EtapaTratamentoSeverity =
  'secondary' | 'warn' | 'success' | 'info' | 'danger' | 'contrast';

export interface EtapaTratamentoConfig {
  label: string;
  cor: string;
  severity: EtapaTratamentoSeverity;
}

export const ETAPA_TRATAMENTO_CONFIG: Record<EtapaTratamento, EtapaTratamentoConfig> = {
  [EtapaTratamento.EM_TRATAMENTO]: {
    label: 'Em tratamento',
    cor: '#00a63e',
    severity: 'success',
  },
  [EtapaTratamento.PROXIMO_ALTA]: {
    label: 'Próximo da alta',
    cor: '#e17100',
    severity: 'warn',
  },
  [EtapaTratamento.ALTA_VENCIDA]: {
    label: 'Alta vencida',
    cor: '#e7000b',
    severity: 'danger',
  },
  [EtapaTratamento.ALTA_CONCEDIDA]: {
    label: 'Alta concedida',
    cor: '#155dfc',
    severity: 'info',
  },
};
