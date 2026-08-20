import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout').then((m) => m.Layout),
    canActivate: [authGuard],
    children: [
      {
        path: 'modalidades',
        loadComponent: () =>
          import('./features/modalidades/pages/modalidades-lista/modalidades-lista').then(
            (m) => m.ModalidadesLista,
          ),
      },
      {
        path: '**',
        loadComponent: () => import('./core/pages/not-found/not-found').then((m) => m.NotFound),
        data: { inLayout: true },
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./core/pages/not-found/not-found').then((m) => m.NotFound),
    data: { inLayout: false },
  },
];
