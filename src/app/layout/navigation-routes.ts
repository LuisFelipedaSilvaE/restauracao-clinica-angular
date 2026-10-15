import {
  LucideBedSingle,
  LucideBriefcase,
  LucideChartColumn,
  LucideFileText,
  LucideIcon,
  LucideLayers,
  LucideLayoutDashboard,
  LucideStethoscope,
  LucideUsersRound
} from '@lucide/angular';

export interface NavigationRoute {
  label: string;
  route: string;
  icon: LucideIcon;
}

export const NAVIGATION_ROUTES: NavigationRoute[] = [
  { label: 'Dashboard', route: 'dashboard', icon: LucideLayoutDashboard },
  { label: 'Convênios', route: 'convenios', icon: LucideLayers },
  { label: 'Internações', route: 'internacoes', icon: LucideBedSingle },
  { label: 'Acolhidos', route: 'acolhidos', icon: LucideUsersRound },
  { label: 'Funcionários', route: 'funcionarios', icon: LucideBriefcase },
  { label: 'Relatórios', route: 'relatorios', icon: LucideChartColumn },
  { label: 'Declarações', route: 'declaracoes', icon: LucideFileText },
  { label: 'Triagens', route: 'triagens', icon: LucideStethoscope },
];
