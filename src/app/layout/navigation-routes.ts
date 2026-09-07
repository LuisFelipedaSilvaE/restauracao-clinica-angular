import {
  LucideBriefcase,
  LucideChartColumn,
  LucideClipboardCheck,
  LucideFileText,
  LucideIcon,
  LucideLayers,
  LucideLayoutDashboard,
  LucideStethoscope,
  LucideUsersRound,
} from '@lucide/angular';

export interface NavigationRoute {
  label: string;
  route: string;
  icon: LucideIcon;
}

export const NAVIGATION_ROUTES: NavigationRoute[] = [
  { label: 'Dashboard', route: 'dashboard', icon: LucideLayoutDashboard },
  { label: 'Modalidades', route: 'modalidades', icon: LucideLayers },
  { label: 'Acolhidos', route: 'acolhidos', icon: LucideUsersRound },
  { label: 'Funcionários', route: 'funcionarios', icon: LucideBriefcase },
  { label: 'Relatórios', route: 'relatorios', icon: LucideChartColumn },
  { label: 'Declarações', route: 'declaracoes', icon: LucideFileText },
  { label: 'Laudos', route: 'laudos', icon: LucideClipboardCheck },
  { label: 'Triagens', route: 'triagens', icon: LucideStethoscope },
];
