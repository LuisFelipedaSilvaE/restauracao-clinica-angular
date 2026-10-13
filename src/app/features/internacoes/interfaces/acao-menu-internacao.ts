import { LucideIcon } from '@lucide/angular';
import { MenuItem } from 'primeng/api';

export interface AcaoMenuInternacao extends MenuItem {
  lucideIcon: LucideIcon;
  iconClass: string;
}
