import {
  LucideBedSingle,
  LucideBriefcase,
  LucideChartColumn,
  LucideFileText,
  LucideIcon,
  LucideLayers,
  LucideLayoutDashboard,
  LucidePill,
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
  { label: 'Convênios', route: 'convenios', icon: LucideLayers },
  { label: 'Internações', route: 'internacoes', icon: LucideBedSingle },
  { label: 'Acolhidos', route: 'acolhidos', icon: LucideUsersRound },
  { label: 'Estoque', route: 'medicamentos', icon: LucidePill },
  { label: 'Funcionários', route: 'funcionarios', icon: LucideBriefcase },
  { label: 'Relatórios', route: 'relatorios', icon: LucideChartColumn },
  { label: 'Declarações', route: 'declaracoes', icon: LucideFileText },
  { label: 'Triagens', route: 'triagens', icon: LucideStethoscope },
];

export function isNavigationRouteActive(
  route: string,
  currentUrl: string,
  routerLinkActive: boolean,
): boolean {
  if (routerLinkActive) return true;

  const [path, queryString = ''] = currentUrl.split('?');
  if (!path.startsWith('/prontuarios/')) return false;

  const origem = new URLSearchParams(queryString.split('#')[0]).get('origem');
  const contextualRoute = origem === 'internacao' ? 'internacoes' : 'acolhidos';

  return route === contextualRoute;
}
