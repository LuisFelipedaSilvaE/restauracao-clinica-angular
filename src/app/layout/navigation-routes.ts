import {
  LucideBedSingle,
  LucideBriefcase,
  LucideIcon,
  LucideLayers,
  LucideLayoutDashboard,
  LucidePill,
  LucideStethoscope,
  LucideUsersRound,
} from '@lucide/angular';
import type { UserRole } from '../core/guards/models/user-role.model';

export interface NavigationRoute {
  label: string;
  route: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export const NAVIGATION_ROUTES: NavigationRoute[] = [
  {
    label: 'Dashboard',
    route: 'dashboard',
    icon: LucideLayoutDashboard,
    roles: ['ADMIN', 'USER'],
  },
  { label: 'Convênios', route: 'convenios', icon: LucideLayers, roles: ['ADMIN', 'USER'] },
  {
    label: 'Internações',
    route: 'internacoes',
    icon: LucideBedSingle,
    roles: ['ADMIN', 'USER'],
  },
  { label: 'Acolhidos', route: 'acolhidos', icon: LucideUsersRound, roles: ['ADMIN', 'USER'] },
  { label: 'Estoque', route: 'medicamentos', icon: LucidePill, roles: ['ADMIN', 'USER'] },
  { label: 'Funcionários', route: 'funcionarios', icon: LucideBriefcase, roles: ['ADMIN'] },
  { label: 'Triagens', route: 'triagens', icon: LucideStethoscope, roles: ['ADMIN', 'USER'] },
];

export function navigationRoutesForRole(role: string | null): NavigationRoute[] {
  return NAVIGATION_ROUTES.filter((route) =>
    route.roles.some((allowedRole) => allowedRole === role),
  );
}

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
