import { LucideIcon } from '@lucide/angular';

export interface InfoCardContent {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  color: string;
}
