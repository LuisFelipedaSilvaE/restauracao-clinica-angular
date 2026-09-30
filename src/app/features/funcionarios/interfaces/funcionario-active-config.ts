import { LucideIcon } from '@lucide/angular';

export interface FuncionarioActiveConfig {
  button: {
    severity: 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined;
    label?: string;
    icon: LucideIcon;
  };
  severity: 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined;
  label: string;
  tooltipValue?: string;
}
