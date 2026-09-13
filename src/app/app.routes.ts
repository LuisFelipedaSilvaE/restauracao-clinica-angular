import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Layout } from './layout/layout';
import { ModalidadesLista } from './features/modalidades/pages/modalidades-lista/modalidades-lista';
import { FuncionariosLista } from './features/funcionarios/pages/funcionarios-lista/funcionarios-lista';
import { ErrorPage } from './core/pages/error-page/error-page';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'acesso-negado',
    component: ErrorPage,
    canActivate: [authGuard],
    data: { status: 403 },
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'modalidades',
        pathMatch: 'full',
      },
      {
        path: 'modalidades',
        component: ModalidadesLista,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'funcionarios',
        component: FuncionariosLista,
        canActivate: [roleGuard('ADMIN')],
      },
    ],
  },
  {
    path: '**',
    component: ErrorPage,
    data: { status: 404 },
  },
];
