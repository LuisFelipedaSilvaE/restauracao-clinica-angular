import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Layout } from './layout/layout';
import { ModalidadesLista } from './features/modalidades/pages/modalidades-lista/modalidades-lista';
import { FuncionariosLista } from './features/funcionarios/pages/funcionarios-lista/funcionarios-lista';
import { NotFound } from './core/pages/not-found/not-found';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
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
      {
        path: '**',
        component: NotFound,
        data: { inLayout: true },
      },
    ],
  },
  {
    path: '**',
    component: NotFound,
    data: { inLayout: false },
  },
];
